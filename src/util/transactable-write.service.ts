import { DynamoDBClient, Put, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';

/**
 * This class is a hack to work around a limitation with the jest-dynalite depedency during e2e tests.
 * For some reason, "transactional" commands are not recognized commands when leveraging jest-dynalite.
 * To get around it, I decided to isolate this code so that I can more easily provide a stub. The stub
 * is essentially a Promise.all for PutItemCommands. That way, items are still added to the local
 * dynamo instance - just not as a "transaction."
 */
@Injectable()
export class TransactableWriteService {
  constructor(private readonly client: DynamoDBClient) {}

  putItemsTransactionally(puts: Put[]): Promise<void> {
    return this.client
      .send(
        new TransactWriteItemsCommand({
          TransactItems: puts.map((put) => {
            return {
              Put: put
            };
          })
        })
      )
      .then();
  }
}
