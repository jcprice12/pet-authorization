import { Injectable } from '@nestjs/common';
import { ScopeMetadata } from './scope-metadata.model';
import { ScopeDescriptions } from './scope.enum';

@Injectable()
export class ScopeMetadataService {
  public readonly namespace = 'jcpets';

  getAllSupportedScopesMetadata(): Array<ScopeMetadata> {
    return Object.entries(ScopeDescriptions).map(([key, value]) => ({ name: key, description: value }));
  }

  getScopeMetadataFor(scopes: Array<string>): Array<ScopeMetadata> {
    const allScopeMetadata = this.getAllSupportedScopesMetadata();
    return scopes.map((scope) => {
      return {
        name: scope,
        description: allScopeMetadata.find((scopeMetadata) => scopeMetadata.name === scope).description
      };
    });
  }

  getAllSupportedScopes(): Array<string> {
    return this.getAllSupportedScopesMetadata().map((scopeMetadata) => scopeMetadata.name);
  }

  getAllSupportedScopesAsStr(): string {
    return this.mapScopesToString(this.getAllSupportedScopesMetadata().map((scopeMetadata) => scopeMetadata.name));
  }

  mapScopesToString(scopes: Array<string>) {
    return scopes
      .reduce((previous, current) => {
        return (previous += `${current} `);
      }, '')
      .trim();
  }
}
