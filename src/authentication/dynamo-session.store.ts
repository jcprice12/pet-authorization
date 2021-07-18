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
import { PetAuthTableName } from '../util/dynamo.config';

@Injectable()
export class DynamoSessionStore extends Store {
  constructor(private readonly dynamoClient: DynamoDBClient) {
    super();
  }

  destroy(sid: string, cb: (error?: Error) => void) {
    this.dynamoClient
      .send(
        new DeleteItemCommand({
          TableName: PetAuthTableName,
          Key: marshall(this.makeKeyBasedOnSid(sid))
        })
      )
      .then(() => cb())
      .catch((e) => cb(e));
  }

  get(sid: string, cb: (error: Error | null, session?: SessionData) => void) {
    const keyVal = `session#${sid}`;
    this.dynamoClient
      .send(
        new GetItemCommand({
          TableName: PetAuthTableName,
          Key: marshall(this.makeKeyBasedOnSid(sid))
        })
      )
      .then((output: GetItemOutput) => {
        console.log('got', output);
        cb(null, unmarshall(output.Item).sessionData);
      })
      .catch((e) => cb(e));
  }

  set(sid: string, session: SessionData, cb: (error?: Error) => void) {
    this.dynamoClient
      .send(
        new PutItemCommand({
          TableName: PetAuthTableName,
          Item: marshall(
            { ...this.makeKeyBasedOnSid(sid), sessionData: session },
            { convertClassInstanceToMap: true, removeUndefinedValues: true }
          )
        })
      )
      .then(() => cb())
      .catch((e) => cb(e));
  }

  private makeKeyBasedOnSid(sid: string) {
    const keyValue = `session#${sid}`;
    return {
      pk: keyValue,
      sk: keyValue
    };
  }
}
