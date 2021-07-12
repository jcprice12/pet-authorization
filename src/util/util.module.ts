import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Module } from '@nestjs/common';
import { dynamoClientFactory } from './dynamo-client.factory';
import { RequiredPipe } from './required.pipe';

const dynamoDBClientProvider = {
  provide: 'DynamoClient',
  useFactory: dynamoClientFactory
};

@Module({
  providers: [RequiredPipe, dynamoDBClientProvider],
  exports: [RequiredPipe, dynamoDBClientProvider]
})
export class UtilModule {}
