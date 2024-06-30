import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { DynamoConfig } from '../util/dynamo-config.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { TransactableWriteService } from '../util/transactable-write.service';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { MaskedUserLogAttribute } from './masked-user.log-attribute';
import { ClientInfoForUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UsersDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly transactableWriteService: TransactableWriteService
  ) {}

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: User) => new MaskedUserLogAttribute('result', result)
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
    if (output.Count) {
      return this.mapMarshalledUserItemToUser(output.Items[0]);
    }
    throw new NotFoundException();
  }

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: User) => new MaskedUserLogAttribute('result', result)
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
    if (output.Item) {
      return this.mapMarshalledUserItemToUser(output.Item);
    }
    throw new NotFoundException();
  }

  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(arg: UserRegistrationDto) => new MaskedUserLogAttribute('arg1', arg)],
    resultMapping: (result: User) => new MaskedUserLogAttribute('result', result)
  })
  async insertUser(user: User): Promise<User> {
    const userKeyVal = `user${this.config.keyDelimiter}${user.id}`;
    const emailKeyVal = `user-email${this.config.keyDelimiter}${user.email}`;
    const userItem = marshall({
      ...user,
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
    return this.mapMarshalledUserItemToUser(userItem);
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
    if (output.Item) {
      return this.mapMarshalledClientInfoForUserToClientInfoForUser(output.Item);
    }
    throw new NotFoundException();
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

  private mapMarshalledUserItemToUser(item: { [key: string]: AttributeValue }): User {
    const unmarshalledItem = unmarshall(item);
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...everythingElse } = unmarshalledItem;
    return {
      ...everythingElse,
      id: pk.split(this.config.keyDelimiter)[1]
    } as User;
  }

  private mapMarshalledClientInfoForUserToClientInfoForUser(item: {
    [key: string]: AttributeValue;
  }): ClientInfoForUser {
    const unmarshalledItem = unmarshall(item);
    const { [this.config.pkName]: pk, [this.config.skName]: sk, scopes } = unmarshalledItem;
    return {
      userId: pk.split(this.config.keyDelimiter)[1],
      clientId: sk.split(this.config.keyDelimiter)[1],
      scopes
    };
  }
}
