import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Global, MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorageMiddleware } from './async-local-storage.middleware';
import { AsyncLocalStorageService } from './async-local-storage.service';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { dynamoClientFactory } from './dynamo-client.factory';
import { DynamoConfig, PET_DYNAMO_CONFIG } from './dynamo-config.model';
import { DynamoUpdateService } from './dynamo-update.service';
import { ExpirationService } from './expiration.service';
import { HashService } from './hash.service';
import { RequiredPipe } from './required.pipe';
import { TransactableWriteService } from './transactable-write.service';

export const PET_AUTH_DYNAMO_CONFIG_PROVIDER = 'PetAuthDynamoConfig';

const dynamoDBClientProvider: Provider = {
  provide: DynamoDBClient,
  useFactory: dynamoClientFactory,
  inject: [ConfigService]
};
const dynamoConfigProvider: Provider<DynamoConfig> = {
  provide: PET_AUTH_DYNAMO_CONFIG_PROVIDER,
  useValue: PET_DYNAMO_CONFIG
};

@Global()
@Module({
  providers: [
    AsyncLocalStorageService,
    RequiredPipe,
    dynamoDBClientProvider,
    HashService,
    dynamoConfigProvider,
    TransactableWriteService,
    ExpirationService,
    DynamoUpdateService
  ],
  exports: [
    AsyncLocalStorageService,
    RequiredPipe,
    dynamoDBClientProvider,
    HashService,
    dynamoConfigProvider,
    TransactableWriteService,
    ExpirationService,
    DynamoUpdateService
  ]
})
export class UtilModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncLocalStorageMiddleware, CorrelationIdMiddleware).forRoutes('*');
  }
}
