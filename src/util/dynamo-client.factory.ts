import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

export const dynamoClientFactory = (configService: ConfigService) => {
  const config = {
    region: 'us-east-1',
    ...(configService.get('NODE_ENV') === 'local' && {
      endpoint: 'http://localhost:8000'
    }),
    ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
      endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
      tls: false,
      region: 'local'
    })
  };
  return new DynamoDBClient(config);
};
