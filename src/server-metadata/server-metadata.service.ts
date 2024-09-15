import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResponseType } from '../authorize/response-type.enum';
import { GrantType } from '../token/grant-type.enum';
import { ScopeMetadataService } from './scope-metadata.service';
import { ServerMetadata } from './server-metadata.model';

@Injectable()
export class ServerMetadataService {
  constructor(private readonly scopeMetadataService: ScopeMetadataService) {}

  getServerMetadata(): ServerMetadata {
    return {
      issuer: this.getHost(),
      authorization_endpoint: `${this.getHost()}/authorize`,
      token_endpoint: `${this.getHost()}/token`,
      registration_endpoint: `${this.getHost()}/clients`,
      userinfo_endpoint: `${this.getHost()}/userinfo`,
      jwks_uri: `${this.getHost()}/keys`,
      scopes_supported: this.scopeMetadataService.getAllSupportedScopesMetadata(),
      response_types_supported: Object.values(ResponseType),
      grant_types_supported: Object.values(GrantType)
    };
  }

  getHost(): string {
    if (process.env.NODE_ENV === 'local') {
      return `https://localhost:${process.env.PORT}`;
    }
    throw new InternalServerErrorException('No host for environment');
  }
}
