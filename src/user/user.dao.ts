import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PetAuthTableName } from '../util/dynamo.config';
import { HashService } from '../util/hash.service';
import { ClientInfoForUserNotFoundError } from './client-info-for-user-not-found.error';
import { UserNotFoundError } from './user-not-found.error';
import { ClientInfoForUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserDao {
  constructor(private readonly client: DynamoDBClient, private readonly hashService: HashService) {}

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

  private mapDbItemToNormalUser(item: { [key: string]: AttributeValue } | undefined) {
    if (item) {
      return this.mapDbUserToNormalUser(unmarshall(item));
    }
    throw new UserNotFoundError();
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
    throw new ClientInfoForUserNotFoundError();
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
