import { Controller, Get, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { ServerMetadata } from './server-metadata.model';
import { ServerMetadataService } from './server-metadata.service';

@Controller('/server-metadata')
export class ServerMetadataController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly serverMetadataService: ServerMetadataService
  ) {}

  // inspired by https://developer.okta.com/docs/reference/api/oidc/#well-known-oauth-authorization-server
  @Get()
  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [() => ({ name: 'req', value: LogAttributeValue.IGNORED })]
  })
  async getServerMetadata(): Promise<ServerMetadata> {
    return this.serverMetadataService.getServerMetadata();
  }
}
