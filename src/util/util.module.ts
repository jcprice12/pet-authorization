import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Global, Module, Provider } from '@nestjs/common';
import { dynamoClientFactory } from './dynamo-client.factory';
import { DynamoConfig, PET_DYNAMO_CONFIG } from './dynamo-config.model';
import { ExpirationService } from './expiration.service';
import { HashService } from './hash.service';
import { RequiredPipe } from './required.pipe';
import { TransactableWriteService } from './transactable-write.service';

export const PET_AUTH_DYNAMO_CONFIG_PROVIDER = 'PetAuthDynamoConfig';

const dynamoDBClientProvider: Provider = {
  provide: DynamoDBClient,
  useFactory: dynamoClientFactory
};
const dynamoConfigProvider: Provider<DynamoConfig> = {
  provide: PET_AUTH_DYNAMO_CONFIG_PROVIDER,
  useValue: PET_DYNAMO_CONFIG
};

@Global()
@Module({
  providers: [
    RequiredPipe,
    dynamoDBClientProvider,
    HashService,
    dynamoConfigProvider,
    TransactableWriteService,
    ExpirationService
  ],
  exports: [
    RequiredPipe,
    dynamoDBClientProvider,
    HashService,
    dynamoConfigProvider,
    TransactableWriteService,
    ExpirationService
  ]
})
export class UtilModule {}
