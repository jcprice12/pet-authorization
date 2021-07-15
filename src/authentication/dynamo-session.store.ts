import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  GetItemOutput,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@nestjs/common';
import { SessionData, Store } from 'express-session';

@Injectable()
export class DynamoSessionStore extends Store {
  private readonly tableName = 'PetAuth';

  constructor(private readonly dynamoClient: DynamoDBClient) {
    super();
  }

  destroy(sid: string, cb: (error?: Error) => void) {
    console.log('destroying', sid);
    this.dynamoClient
      .send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ pk: `session#${sid}` })
        })
      )
      .then(() => cb())
      .catch((e) => cb(e));
  }

  get(sid: string, cb: (error: Error | null, session?: SessionData) => void) {
    console.log('getting', sid);
    this.dynamoClient
      .send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: marshall({ pk: `session#${sid}` })
        })
      )
      .then((output: GetItemOutput) => {
        console.log('got', output);
        cb(null, unmarshall(output.Item).sessionData);
      })
      .catch((e) => cb(e));
  }

  set(sid: string, session: SessionData, cb: (error?: Error) => void) {
    console.log('setting', sid, session);
    this.dynamoClient
      .send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(
            { pk: `session#${sid}`, sessionData: session },
            { convertClassInstanceToMap: true, removeUndefinedValues: true }
          )
        })
      )
      .then(() => cb())
      .catch((e) => cb(e));
  }
}
