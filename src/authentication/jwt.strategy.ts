import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { exportSPKI, KeyLike } from 'jose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { KEY_PAIR_SERVICE_PROVIDER } from '../keys/key-pair-service.provider';
import { KeyPair } from '../keys/key-pair.model';
import { KeyPairService } from '../keys/key-pair.service';
import { PublicUser } from '../users/user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    @Inject(KEY_PAIR_SERVICE_PROVIDER) keyPairService: KeyPairService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        _request: Request,
        _rawJwtToken: any,
        done: (err: any, secretOrKey?: string | Buffer) => void
      ) => {
        /**
         * Note I am not decoding the JWT here (Passport says it is up to me to do so).
         * I am not sure what I would use on the decoded JWT. Most likely, I would need
         * to determine which key to use from it; however, I am currently not setting
         * a "kid" on the JWT so I can't really use the JWT for that purpse at the moment.
         */
        try {
          const keyPair: KeyPair = await keyPairService.getKeyPair();
          const publicKey: KeyLike = keyPair.publicKey;
          const publicKeyPem: string = await exportSPKI(publicKey);
          done(null, publicKeyPem);
        } catch (e) {
          done(e);
        }
      }
    });
  }

  /**
   * Because the JWT is signed and has been verified by passport at this point, I can just return the PublicUser object for the user id
   * @param accessTokenPayload B
   * @returns PublicUser
   */
  async validate(accessTokenPayload: any): Promise<PublicUser> {
    return this.usersService.getPublicUserById(accessTokenPayload.sub);
  }
}
