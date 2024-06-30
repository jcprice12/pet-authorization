import { AttributeValue, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { DynamoConfig } from '../util/dynamo-config.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { PET_AUTH_DYNAMO_CONFIG_PROVIDER } from '../util/util.module';
import { Client } from './client.model';

@Injectable()
export class ClientsDao {
  constructor(
    private readonly client: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async insertClient(client: Client): Promise<Client> {
    const pkValue = `client${this.config.keyDelimiter}${client.client_id}`;
    const skValue = `client-id-issued-at${this.config.keyDelimiter}${client.client_id_issued_at}`;
    const marshalledClientItem = marshall({
      ...client,
      [this.config.pkName]: pkValue,
      [this.config.skName]: skValue
    });
    await this.client.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: marshalledClientItem
      })
    );
    return this.mapMarshalledClientItemToClient(marshalledClientItem);
  }

  private mapMarshalledClientItemToClient(marshalledClientItem: { [key: string]: AttributeValue }): Client {
    const unmarshalledClientItem = unmarshall(marshalledClientItem);
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...client } = unmarshalledClientItem;
    return client as Client;
  }
}
