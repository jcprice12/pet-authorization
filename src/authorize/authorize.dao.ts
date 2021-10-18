import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { DynamoConfig } from '../util/dynamo-config.model';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedAuthCodeLogAttribute } from './masked-auth-code.log-attribute';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { AuthCode } from './authorize.model';

@Injectable()
export class AuthorizeDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: AuthCode) => new MaskedAuthCodeLogAttribute('result', result)
  })
  async insertAuthCode(authCode: Omit<AuthCode, 'code'>): Promise<AuthCode> {
    const authCodeItem = marshall({
      ...this.makeUnmarshalledKeyForAuthCodeItem(),
      ...authCode
    });
    await this.client.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: authCodeItem
      })
    );
    return this.mapDbItemToAuthCode(authCodeItem);
  }

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: AuthCode) => new MaskedAuthCodeLogAttribute('result', result)
  })
  async getAuthCode(code: string): Promise<AuthCode> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: this.makeKeyForAuthCodeItem(code)
      })
    );
    return this.mapDbItemToAuthCode(output.Item);
  }

  @LogPromise(retrieveLoggerOnClass, { argMappings: [() => ({ name: 'code', value: LogAttributeValue.MASK })] })
  async updateConsumeFlagForAuthCode(code: string, isConsumed: boolean) {
    this.client.send(
      new UpdateItemCommand({
        TableName: this.config.tableName,
        Key: this.makeKeyForAuthCodeItem(code),
        UpdateExpression: 'set isConsumed = :isConsumed',
        ExpressionAttributeValues: marshall({
          ':isConsumed': isConsumed
        })
      })
    );
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

  private makeAuthCodeKeyValue(code: string = uuidv4()): string {
    return `auth-code${this.config.keyDelimiter}${code}`;
  }

  private makeUnmarshalledKeyForAuthCodeItem(code?: string): { [key: string]: string } {
    const authCodeKeyValue = this.makeAuthCodeKeyValue(code);
    return {
      [this.config.pkName]: authCodeKeyValue,
      [this.config.skName]: authCodeKeyValue
    };
  }

  private makeKeyForAuthCodeItem(code?: string): {
    [key: string]: AttributeValue;
  } {
    return marshall(this.makeUnmarshalledKeyForAuthCodeItem(code));
  }
}
