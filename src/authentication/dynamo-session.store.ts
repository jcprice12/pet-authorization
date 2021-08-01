import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  GetItemOutput,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { SessionData, Store } from 'express-session';
import { DynamoConfig } from '../util/dynamo-config.model';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';

@Injectable()
export class DynamoSessionStore extends Store {
  constructor(
    private readonly dynamoClient: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig
  ) {
    super();
  }

  destroy(sid: string, cb: (error?: Error) => void) {
    this.dynamoClient
      .send(
        new DeleteItemCommand({
          TableName: this.config.tableName,
          Key: marshall(this.makeKeyBasedOnSid(sid))
        })
      )
      .then(() => cb())
      .catch((e) => cb(e));
  }

  get(sid: string, cb: (error: Error | null, session?: SessionData) => void) {
    this.dynamoClient
      .send(
        new GetItemCommand({
          TableName: this.config.tableName,
          Key: marshall(this.makeKeyBasedOnSid(sid))
        })
      )
      .then((output: GetItemOutput) => {
        cb(null, unmarshall(output.Item).sessionData);
      })
      .catch((e) => cb(e));
  }

  set(sid: string, session: SessionData, cb: (error?: Error) => void) {
    this.dynamoClient
      .send(
        new PutItemCommand({
          TableName: this.config.tableName,
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
    const keyValue = `session${this.config.keyDelimiter}${sid}`;
    return {
      pk: keyValue,
      sk: keyValue
    };
  }
}
