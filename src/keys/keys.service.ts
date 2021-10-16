import { Injectable } from '@nestjs/common';
import { Algorithm } from './algorithm.enum';
import { JWKS } from './jwks.model';
import { KeyType } from './key-type.enum';
import { PublicKeyUse } from './public-key-use';

@Injectable()
export class KeysService {
  getKeySet(): JWKS {
    return {
      keys: [
        {
          alg: Algorithm.RS256,
          use: PublicKeyUse.SIG,
          kty: KeyType.RSA,
          kid: 'foo'
        }
      ]
    };
  }
}
