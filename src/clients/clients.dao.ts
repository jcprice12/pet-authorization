import { AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly dynamoClient: DynamoDBClient,
    @Inject(PET_AUTH_DYNAMO_CONFIG_PROVIDER) private readonly config: DynamoConfig,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async insertClient(client: Client): Promise<Client> {
    const marshalledClientItem = marshall({
      ...client,
      ...this.makeUnmarshalledKeyForClientItem(client.client_id)
    });
    await this.dynamoClient.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: marshalledClientItem
      })
    );
    return this.mapMarshalledClientItemToClient(marshalledClientItem);
  }

  @LogPromise(retrieveLoggerOnClass)
  async findClient(clientId: string): Promise<Client> {
    const output = await this.dynamoClient.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: this.makeKeyForClientItem(clientId)
      })
    );
    if (output.Item) {
      return this.mapMarshalledClientItemToClient(output.Item);
    }
    throw new NotFoundException();
  }

  private mapMarshalledClientItemToClient(marshalledClientItem: { [key: string]: AttributeValue }): Client {
    const unmarshalledClientItem = unmarshall(marshalledClientItem);
    const { [this.config.pkName]: pk, [this.config.skName]: sk, ...client } = unmarshalledClientItem;
    return client as Client;
  }

  private makeClientKeyValue(clientId: string): string {
    return `client${this.config.keyDelimiter}${clientId}`;
  }

  private makeUnmarshalledKeyForClientItem(clientId: string): { [key: string]: string } {
    const authCodeKeyValue = this.makeClientKeyValue(clientId);
    return {
      [this.config.pkName]: authCodeKeyValue,
      [this.config.skName]: authCodeKeyValue
    };
  }

  private makeKeyForClientItem(clientId: string): {
    [key: string]: AttributeValue;
  } {
    return marshall(this.makeUnmarshalledKeyForClientItem(clientId));
  }
}
