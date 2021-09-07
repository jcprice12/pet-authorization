import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dynamoClientFactory = () => {
  const config = {
    region: 'us-east-1',
    ...(process.env.NODE_ENV === 'local' && {
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
