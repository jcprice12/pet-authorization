import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Client, ClientRegistrationDto } from './client.model';
import { ClientsDao } from './clients.dao';

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
    return this.clientsDao.insertClient(client);
  }
}
