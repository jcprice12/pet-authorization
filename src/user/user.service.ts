import { DynamoDBClient, ExecuteTransactionCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  constructor(@Inject('DynamoClient') private readonly client: DynamoDBClient) {}

  async findOneByEmail(email: string): Promise<UserEntity | undefined> {
    const output = await this.client.send(
      new QueryCommand({
        TableName: 'PetAuth',
        IndexName: 'Email-index',
        ExpressionAttributeValues: marshall({
          ':email': email
        }),
        KeyConditionExpression: 'email = :email'
      })
    );
    const user = output?.Items[0] ? (unmarshall(output.Items[0]) as UserEntity) : undefined;
    console.log(user);
    return user;
  }

  async findOneById(id: string): Promise<UserEntity | undefined> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: 'PetAuth',
        Key: marshall({
          pk: id
        })
      })
    );
    const user = output?.Item ? (unmarshall(output.Item) as UserEntity) : undefined;
    console.log(user);
    return user;
  }

  async register(user: UserRegistrationDto): Promise<void> {
    // const id = uuidv4();
    // this.client.send(new ExecuteTransactionCommand({
    //   TransactStatements: [
    //     {
    //       Statement: '',
    //       Parameters: [

    //       ]
    //     }
    //   ]
    // }));
    if (await this.findOneByEmail(user.email)) {
      throw new UnprocessableEntityException('user exists with that email');
    }
    const newUser: UserEntity = {
      ...user,
      id: uuidv4()
    };
  }
}
