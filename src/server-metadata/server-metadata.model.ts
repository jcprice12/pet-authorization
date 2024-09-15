import { ScopeMetadata } from './scope-metadata.model';

export interface ServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  registration_endpoint: string;
  jwks_uri: string;
  scopes_supported: Array<ScopeMetadata>;
}
