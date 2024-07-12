import { Injectable } from '@nestjs/common';
import { ScopeMetadata } from './scope-metadata.model';

@Injectable()
export class ScopeMetadataService {
  public readonly namespace: 'jcpets';

  getAllSupportedScopesMetadata(): Array<ScopeMetadata> {
    return [
      {
        name: 'openid',
        description: 'Your ID'
      },
      {
        name: 'profile',
        description: 'Your profile information'
      },
      {
        name: 'email',
        description: 'Your email'
      },
      {
        name: `${this.namespace}.roles`,
        description: 'Whatever roles you may have'
      }
    ];
  }
}
