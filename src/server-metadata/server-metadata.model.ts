import { ResponseType } from '../authorize/response-type.enum';
import { GrantType } from '../token/grant-type.enum';
import { ScopeMetadata } from './scope-metadata.model';

export interface ServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  registration_endpoint: string;
  jwks_uri: string;
  scopes_supported: Array<ScopeMetadata>;
  response_types_supported: Array<ResponseType>;
  grant_types_supported: Array<GrantType>;
}
