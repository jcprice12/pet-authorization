import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const isLocal = process.env.NODE_ENV === 'local';
const isTest = process.env.JEST_WORKER_ID;

export const dynamoClientFactory = () => {
  return new DynamoDBClient({
    region: 'us-east-1',
    ...(isLocal && {
      endpoint: 'http://localhost:8000'
    }),
    ...(isTest && {
      endpoint: 'http://localhost:8001',
      sslEnabled: false,
      region: 'local-env',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey'
      }
    })
  });
};
