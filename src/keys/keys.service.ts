import { Inject, Injectable } from '@nestjs/common';
import { exportJWK } from 'jose';
import { Algorithm } from './algorithm.enum';
import { JWKS } from './jwks.model';
import { KEY_PAIR_SERVICE_PROVIDER } from './key-pair-service.provider';
import { KeyPairService } from './key-pair.service';
import { PublicKeyUse } from './public-key-use';

@Injectable()
export class KeysService {
  constructor(@Inject(KEY_PAIR_SERVICE_PROVIDER) private readonly keyPairService: KeyPairService) {}

  async getKeySet(): Promise<JWKS> {
    const keyPair = await this.keyPairService.getKeyPair();
    return {
      keys: [
        {
          ...(await exportJWK(keyPair.publicKey)),
          kid: keyPair.kid,
          use: PublicKeyUse.SIG,
          alg: Algorithm.RS256
        }
      ]
    };
  }
}
