import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { PetAuthTableName } from '../util/dynamo.config';
import { HashService } from '../util/hash.service';
import { Log } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedPasswordLogAttribute } from '../util/masked-password.log-attribute';
import { ClientInfoForUserNotFoundError } from './client-info-for-user-not-found.error';
import { UserNotFoundError } from './user-not-found.error';
import { ClientInfoForUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserDao {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly hashService: HashService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Log(retrieveLoggerOnClass, {
    logPromise: true,
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async findOneByEmail(email: string): Promise<User> {
    const output = await this.client.send(
      new QueryCommand({
        TableName: PetAuthTableName,
        IndexName: 'Email-index',
        ExpressionAttributeValues: marshall({
          ':email': email
        }),
        KeyConditionExpression: 'email = :email'
      })
    );
    return this.mapDbItemToNormalUser(output.Items[0]);
  }

  @Log(retrieveLoggerOnClass, {
    logPromise: true,
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async findOneById(id: string): Promise<User> {
    const keyVal = `user#${id}`;
    const output = await this.client.send(
      new GetItemCommand({
        TableName: PetAuthTableName,
        Key: marshall({
          pk: keyVal,
          sk: keyVal
        })
      })
    );
    return this.mapDbItemToNormalUser(output.Item);
  }

  @Log(retrieveLoggerOnClass, {
    logPromise: true,
    argMappings: [(arg: UserRegistrationDto) => new MaskedPasswordLogAttribute('arg1', arg)],
    resultMapping: (result: User) => new MaskedPasswordLogAttribute('result', result)
  })
  async insertOne(userDto: UserRegistrationDto): Promise<User> {
    const userKeyVal = `user#${uuidv4()}`;
    const emailKeyVal = `user-email#${userDto.email}`;
    const userItem = marshall({
      ...userDto,
      password: await this.hashService.hashWithSalt(userDto.password),
      pk: userKeyVal,
      sk: userKeyVal
    });
    await this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: PetAuthTableName,
              ConditionExpression: 'attribute_not_exists(pk)',
              Item: userItem
            }
          },
          {
            Put: {
              TableName: PetAuthTableName,
              ConditionExpression: 'attribute_not_exists(pk)',
              Item: marshall({
                pk: emailKeyVal,
                sk: emailKeyVal
              })
            }
          }
        ]
      })
    );
    return this.mapDbItemToNormalUser(userItem);
  }

  @Log(retrieveLoggerOnClass, { logPromise: true })
  async findClientInfoForUser(userId: string, clientId: string): Promise<ClientInfoForUser> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: PetAuthTableName,
        Key: marshall({
          pk: `user#${userId}`,
          sk: `client#${clientId}`
        })
      })
    );
    return this.mapDbItemToClientInfo(output.Item);
  }

  @Log(retrieveLoggerOnClass, { logPromise: true })
  async updateClientScopesForUser(clientInfoForUser: ClientInfoForUser): Promise<void> {
    const { userId, clientId, scopes } = clientInfoForUser;
    this.client.send(
      new UpdateItemCommand({
        TableName: PetAuthTableName,
        Key: marshall({
          pk: `user#${userId}`,
          sk: `client#${clientId}`
        }),
        UpdateExpression: 'set scopes = :scopes',
        ExpressionAttributeValues: marshall({
          ':scopes': scopes
        })
      })
    );
  }

  private mapDbItemToNormalUser(item: { [key: string]: AttributeValue } | undefined) {
    if (item) {
      return this.mapDbUserToNormalUser(unmarshall(item));
    }
    throw new UserNotFoundError('No user found in db matching criteria');
  }

  private mapDbUserToNormalUser(dbUser): User {
    const { pk, sk, ...everythingElse } = dbUser;
    return {
      ...everythingElse,
      id: pk.split('#')[1]
    };
  }

  private mapDbItemToClientInfo(
    item: { [key: string]: AttributeValue } | undefined
  ): ClientInfoForUser {
    if (item) {
      return this.mapDbClientInfoForUserToClientInfoForUser(unmarshall(item));
    }
    throw new ClientInfoForUserNotFoundError('No client info for user in db');
  }

  private mapDbClientInfoForUserToClientInfoForUser(dbClientInfoForUser): ClientInfoForUser {
    const { pk, sk, scopes } = dbClientInfoForUser;
    return {
      userId: pk.split('#')[1],
      clientId: sk.split('#')[1],
      scopes
    };
  }
}
