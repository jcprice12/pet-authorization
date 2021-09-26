import { AttributeValue, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { DynamoConfig } from '../util/dynamo-config.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { AuthCode } from './authorize.model';

@Injectable()
export class AuthorizeDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async insertAuthCode(authCode: Omit<AuthCode, 'code'>): Promise<AuthCode> {
    const authCodeKeyValue = `auth-code${this.config.keyDelimiter}${uuidv4()}`;
    const authCodeItem = marshall({
      [this.config.pkName]: authCodeKeyValue,
      [this.config.skName]: authCodeKeyValue,
      clientId: authCode.clientId,
      userId: authCode.userId,
      isConsumed: authCode.isConsumed,
      expires: authCode.expires
    });
    await this.client.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: authCodeItem
      })
    );
    return this.mapDbItemToAuthCode(authCodeItem);
  }

  private mapDbItemToAuthCode(item: { [key: string]: AttributeValue } | undefined): AuthCode | undefined {
    return item ? this.mapDbAuthCodeToAuthCode(unmarshall(item)) : undefined;
  }

  private mapDbAuthCodeToAuthCode(dbAuthCode): AuthCode {
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...everythingElse } = dbAuthCode;
    return {
      ...everythingElse,
      code: pk.split(this.config.keyDelimiter)[1]
    };
  }
}
