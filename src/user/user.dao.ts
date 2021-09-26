import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { DynamoConfig } from '../util/dynamo-config.model';
import { HashService } from '../util/hash.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedPasswordLogAttribute } from '../util/masked-password.log-attribute';
import { TransactableWriteService } from '../util/transactable-write.service';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { ClientInfoForUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserDao {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly hashService: HashService,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly transactableWriteService: TransactableWriteService
  ) {}

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async findUserByEmail(email: string): Promise<User> {
    const output = await this.client.send(
      new QueryCommand({
        TableName: this.config.tableName,
        IndexName: 'Email-index',
        ExpressionAttributeValues: marshall({
          ':email': email
        }),
        KeyConditionExpression: 'email = :email'
      })
    );
    return this.mapDbItemToUser(output.Items[0]);
  }

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async findUserById(id: string): Promise<User> {
    const keyVal = `user${this.config.keyDelimiter}${id}`;
    const output = await this.client.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: marshall({
          [this.config.pkName]: keyVal,
          [this.config.skName]: keyVal
        })
      })
    );
    return this.mapDbItemToUser(output.Item);
  }

  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(arg: UserRegistrationDto) => new MaskedPasswordLogAttribute('arg1', arg)],
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async insertUser(userDto: UserRegistrationDto): Promise<User> {
    const userKeyVal = `user${this.config.keyDelimiter}${uuidv4()}`;
    const emailKeyVal = `user-email${this.config.keyDelimiter}${userDto.email}`;
    const userItem = marshall({
      ...userDto,
      password: await this.hashService.hashWithSalt(userDto.password),
      [this.config.pkName]: userKeyVal,
      [this.config.skName]: userKeyVal
    });
    await this.transactableWriteService.putItemsTransactionally([
      {
        TableName: this.config.tableName,
        ConditionExpression: `attribute_not_exists(${this.config.pkName})`,
        Item: userItem
      },
      {
        TableName: this.config.tableName,
        ConditionExpression: `attribute_not_exists(${this.config.pkName})`,
        Item: marshall({
          [this.config.pkName]: emailKeyVal,
          [this.config.skName]: emailKeyVal
        })
      }
    ]);
    return this.mapDbItemToUser(userItem);
  }

  @LogPromise(retrieveLoggerOnClass)
  async findClientInfoForUser(userId: string, clientId: string): Promise<ClientInfoForUser> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: marshall({
          [this.config.pkName]: `user${this.config.keyDelimiter}${userId}`,
          [this.config.skName]: `client${this.config.keyDelimiter}${clientId}`
        })
      })
    );
    return this.mapDbItemToClientInfo(output.Item);
  }

  @LogPromise(retrieveLoggerOnClass)
  async updateClientScopesForUser(clientInfoForUser: ClientInfoForUser): Promise<void> {
    const { userId, clientId, scopes } = clientInfoForUser;
    this.client.send(
      new UpdateItemCommand({
        TableName: this.config.tableName,
        Key: marshall({
          [this.config.pkName]: `user${this.config.keyDelimiter}${userId}`,
          [this.config.skName]: `client${this.config.keyDelimiter}${clientId}`
        }),
        UpdateExpression: 'set scopes = :scopes',
        ExpressionAttributeValues: marshall(
          {
            ':scopes': scopes
          },
          { removeUndefinedValues: true }
        )
      })
    );
  }

  private mapDbItemToUser(item: { [key: string]: AttributeValue } | undefined): User | undefined {
    return item ? this.mapDbUserToUser(unmarshall(item)) : undefined;
  }

  private mapDbUserToUser(dbUser): User {
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...everythingElse } = dbUser;
    return {
      ...everythingElse,
      id: pk.split(this.config.keyDelimiter)[1]
    };
  }

  private mapDbItemToClientInfo(item: { [key: string]: AttributeValue } | undefined): ClientInfoForUser | undefined {
    return item ? this.mapDbClientInfoForUserToClientInfoForUser(unmarshall(item)) : undefined;
  }

  private mapDbClientInfoForUserToClientInfoForUser(dbClientInfoForUser): ClientInfoForUser {
    const { [this.config.pkName]: pk, [this.config.skName]: sk, scopes } = dbClientInfoForUser;
    return {
      userId: pk.split(this.config.keyDelimiter)[1],
      clientId: sk.split(this.config.keyDelimiter)[1],
      scopes
    };
  }
}
