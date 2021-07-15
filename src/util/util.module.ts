import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Module } from '@nestjs/common';
import { dynamoClientFactory } from './dynamo-client.factory';
import { HashService } from './hash.service';
import { RequiredPipe } from './required.pipe';

const dynamoDBClientProvider = {
  provide: DynamoDBClient,
  useFactory: dynamoClientFactory
};

@Module({
  providers: [RequiredPipe, dynamoDBClientProvider, HashService],
  exports: [RequiredPipe, dynamoDBClientProvider, HashService]
})
export class UtilModule {}
