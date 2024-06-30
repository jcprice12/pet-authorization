import { AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AtLeastOne } from '../util/app-util.types';
import { DynamoConfig } from '../util/dynamo-config.model';
import { DynamoUpdateService } from '../util/dynamo-update.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { AuthCode } from './auth-code.model';

@Injectable()
export class AuthorizeDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly updateService: DynamoUpdateService
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async insertAuthCode(authCode: AuthCode): Promise<AuthCode> {
    const authCodeItem = marshall({
      ...this.makeUnmarshalledKeyForAuthCodeItem(authCode.code),
      ...authCode
    });
    await this.client.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: authCodeItem
      })
    );
    return this.mapMarshalledAuthCodeItemToAuthCode(authCodeItem);
  }

  @LogPromise(retrieveLoggerOnClass)
  async findAuthCode(code: string): Promise<AuthCode> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: this.makeKeyForAuthCodeItem(code)
      })
    );
    if (output.Item) {
      return this.mapMarshalledAuthCodeItemToAuthCode(output.Item);
    }
    throw new NotFoundException();
  }

  @LogPromise(retrieveLoggerOnClass)
  async updateAuthCode(authCode: { code: string } & AtLeastOne<Omit<AuthCode, 'code'>>): Promise<void> {
    const { code, ...everythingElse } = authCode;
    await this.client.send(
      this.updateService.buildBasicUpdateCommand(
        this.config.tableName,
        {
          ...this.makeUnmarshalledKeyForAuthCodeItem(code),
          ...everythingElse
        },
        (key) => key === this.config.pkName || key === this.config.skName
      )
    );
  }

  private mapMarshalledAuthCodeItemToAuthCode(item: { [key: string]: AttributeValue }): AuthCode {
    const unmarshalledItem = unmarshall(item);
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...everythingElse } = unmarshalledItem;
    return {
      ...everythingElse,
      code: pk.split(this.config.keyDelimiter)[1]
    } as AuthCode;
  }

  private makeAuthCodeKeyValue(code: string): string {
    return `auth-code${this.config.keyDelimiter}${code}`;
  }

  private makeUnmarshalledKeyForAuthCodeItem(code: string): { [key: string]: string } {
    const authCodeKeyValue = this.makeAuthCodeKeyValue(code);
    return {
      [this.config.pkName]: authCodeKeyValue,
      [this.config.skName]: authCodeKeyValue
    };
  }

  private makeKeyForAuthCodeItem(code: string): {
    [key: string]: AttributeValue;
  } {
    return marshall(this.makeUnmarshalledKeyForAuthCodeItem(code));
  }
}
