import { ResponseType } from '../authorize/response-type.enum';
import { GrantType } from '../token/grant-type.enum';
import { Scope } from './scope.enum';
import { SubjectType } from './subject-type.enum';
import { Algorithm } from '../keys/algorithm.enum';

export interface ServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  registration_endpoint: string;
  jwks_uri: string;
  scopes_supported: Array<Scope>;
  response_types_supported: Array<ResponseType>;
  grant_types_supported: Array<GrantType>;
  subject_types_supported: Array<SubjectType>;
  id_token_signing_alg_values_supported: Array<Algorithm>;
}
