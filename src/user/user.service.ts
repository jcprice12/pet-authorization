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
import { HashService } from '../util/hash.service';
import { UserNotFoundError } from './user-not-found.error';
import { DbUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  private readonly tableName = 'PetAuth';

  constructor(private readonly client: DynamoDBClient, private readonly hashService: HashService) {}

  async findOneByEmail(email: string): Promise<User> {
    const output = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
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
        TableName: this.tableName,
        Key: marshall({
          pk: keyVal,
          sk: keyVal
        })
      })
    );
    return this.mapDbItemToNormalUser(output.Item);
  }

  async insertOne(user: UserRegistrationDto): Promise<void> {
    const userKeyVal = `user#${uuidv4()}`;
    const emailKeyVal = `user-email#${user.email}`;
    await this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              ConditionExpression: 'attribute_not_exists(pk)',
              Item: marshall({
                ...user,
                password: await this.hashService.hashWithSalt(user.password),
                pk: userKeyVal,
                sk: userKeyVal
              })
            }
          },
          {
            Put: {
              TableName: this.tableName,
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
  }

  private mapDbItemToNormalUser(item: { [key: string]: AttributeValue } | undefined) {
    if (item) {
      return this.mapDbUserToNormalUser(unmarshall(item) as DbUser);
    }
    throw new UserNotFoundError();
  }

  private mapDbUserToNormalUser(dbUser: DbUser): User {
    const { pk, sk, ...everythingElse } = dbUser;
    return {
      ...everythingElse,
      id: pk.split('#')[1]
    };
  }
}
