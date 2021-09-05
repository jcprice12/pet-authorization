import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Global, Module, Provider } from '@nestjs/common';
import { dynamoClientFactory } from './dynamo-client.factory';
import { DynamoConfig } from './dynamo-config.model';
import { HashService } from './hash.service';
import { RequiredPipe } from './required.pipe';

export const PET_AUTH_DYNAMO_CONFIG_PROVIDER = 'PetAuthDynamoConfig';

const dynamoDBClientProvider: Provider = {
  provide: DynamoDBClient,
  useFactory: dynamoClientFactory
};
const dynamoConfigProvider: Provider<DynamoConfig> = {
  provide: PET_AUTH_DYNAMO_CONFIG_PROVIDER,
  useValue: {
    tableName: 'PetAuth',
    pkName: 'pk',
    skName: 'sk',
    keyDelimiter: '#'
  }
};

@Global()
@Module({
  providers: [RequiredPipe, dynamoDBClientProvider, HashService, dynamoConfigProvider],
  exports: [RequiredPipe, dynamoDBClientProvider, HashService, dynamoConfigProvider]
})
export class UtilModule {}
