import { KeyType } from './key-type.enum';
import { PublicKeyUse } from './public-key-use';
import { Algorithm } from './algorithm.enum';

/**
 * https://datatracker.ietf.org/doc/html/rfc7517
 */
export interface JWK {
  kty: KeyType;
  use: PublicKeyUse; //optional in spec but this app's flows require it
  alg: Algorithm; //optional in spec but this app's flows require it
  kid: string; //optional in spec but this app's flows require it
}
