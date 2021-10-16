import { JWK } from './jwk.model';

/**
 * https://datatracker.ietf.org/doc/html/rfc7517
 */
export interface JWKS {
  keys: Array<JWK>;
}
