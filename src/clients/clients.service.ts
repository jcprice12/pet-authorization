import { Inject, Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { DateTime } from 'luxon';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { HashService } from '../util/hash.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Client, ClientRegistrationDto } from './client.model';
import { ClientsDao } from './clients.dao';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsDao: ClientsDao,
    private readonly hashService: HashService,
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
      const clientCopy = cloneDeep(client);
      clientCopy.client_secret = await this.hashService.hashWithSalt(client.client_secret, 0);
      this.clientsDao.insertClient(clientCopy);
    }
    return client;
  }
}
