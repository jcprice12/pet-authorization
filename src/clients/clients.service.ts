import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Client, ClientRegistrationDto } from './client.model';
import { ClientsDao } from './clients.dao';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsDao: ClientsDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async registerClient(clientRegistrationDto: ClientRegistrationDto): Promise<Client> {
    const client: Client = {
      client_id: uuidv4(),
      client_id_issued_at: DateTime.utc().toISO(),
      ...clientRegistrationDto
    };
    if (clientRegistrationDto.isConfidential) {
      client.client_secret = uuidv4();
      client.client_secret_expires_at = 0;
    }
    const clientCopy = cloneDeep(client);
    await this.clientsDao.insertClient(clientCopy);
    return client;
  }
}
