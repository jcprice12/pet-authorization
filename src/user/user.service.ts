import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserNotFoundError } from './user-not-found.error';
import { DbUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  private readonly tableName = 'PetAuth';

  constructor(@Inject('DynamoClient') private readonly client: DynamoDBClient) {}

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
    const output = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          pk: id
        })
      })
    );
    return this.mapDbItemToNormalUser(output.Item);
  }

  async insertOne(user: UserRegistrationDto): Promise<void> {
    const dbUser = {
      ...user,
      pk: uuidv4()
    };
    await this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              ConditionExpression: 'attribute_not_exists(pk)',
              Item: marshall(dbUser)
            }
          },
          {
            Put: {
              TableName: this.tableName,
              ConditionExpression: 'attribute_not_exists(pk)',
              Item: marshall({
                pk: dbUser.email
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
    const { pk, ...everythingElse } = dbUser;
    return {
      ...everythingElse,
      id: pk
    };
  }
}
