import { Body, Controller, Inject, Post } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { Client, ClientRegistrationDto } from './client.model';
import { ClientsService } from './clients.service';

@Controller('/clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Post()
  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [() => ({ name: 'req', value: LogAttributeValue.IGNORED })]
  })
  registerClient(@Body() clientRegistrationDto: ClientRegistrationDto): Promise<Client> {
    return this.clientsService.registerClient(clientRegistrationDto);
  }
}
