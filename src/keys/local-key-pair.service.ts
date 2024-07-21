import { Injectable, OnModuleInit } from '@nestjs/common';
import { generateKeyPair } from 'jose';
import { Algorithm } from './algorithm.enum';
import { KeyPair } from './key-pair.model';
import { KeyPairService } from './key-pair.service';

/**
 * The reason this class is for "local development" only is because the "generateKeyPair" function
 * generates a new key pair every time it is invoked. So, if this app is deployed with more than one instance,
 * then users won't be able to verify their JWTs since every instance will have a different key pair.
 *
 * For prod, I will need to generate a private key outside of the app. The key will use the pkcs8 syntax
 * and be stored in something like AWS Secrets Manager in the PEM format. The app will retrieve that
 * private key and then derive the public key from it using Node's built-in crypto library:
 * https://stackoverflow.com/questions/28767837/extract-public-key-from-private-key-pem-using-only-nodejs-javascript
 * I can use the jose module to "import" those keys and manage them in the app.
 */
@Injectable()
export class LocalKeyPairService implements KeyPairService, OnModuleInit {
  private keyPair: KeyPair;

  async onModuleInit(): Promise<void> {
    this.keyPair = {
      ...(await generateKeyPair(Algorithm.RS256)),
      kid: 'local-key',
      alg: Algorithm.RS256
    };
  }

  getKeyPair(): Promise<KeyPair> {
    return Promise.resolve(this.keyPair);
  }
}
