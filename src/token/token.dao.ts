import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { DynamoConfig } from '../util/dynamo-config.model';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';

@Injectable()
export class TokenDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig
  ) {}
}
