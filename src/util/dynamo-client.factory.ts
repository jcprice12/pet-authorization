import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

export const dynamoClientFactory = (configService: ConfigService) => {
  const config = {
    ...(configService.get('DYNAMO_DB_LOCAL_ENDPOINT') && {
      endpoint: configService.get('DYNAMO_DB_LOCAL_ENDPOINT')
    }),
    ...(configService.get('MOCK_DYNAMODB_ENDPOINT') && {
      endpoint: configService.get('MOCK_DYNAMODB_ENDPOINT'),
      tls: false,
      region: 'local'
    })
  };
  const client = new DynamoDBClient(config);
  return client;
};
