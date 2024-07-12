import { Injectable } from '@nestjs/common';
import { ScopeMetadataService } from './scope-metadata.service';
import { ServerMetadata } from './server-metadata.model';

@Injectable()
export class ServerMetadataService {
  constructor(private readonly scopeMetadataService: ScopeMetadataService) {}

  getServerMetadata(): ServerMetadata {
    return {
      supported_scopes: this.scopeMetadataService.getAllSupportedScopesMetadata()
    };
  }
}
