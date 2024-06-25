import { Inject, Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthCodeNotFoundError } from '../authorize/auth-code-not-found.error';
import { AuthCode } from '../authorize/auth-code.model';
import { AuthorizeService } from '../authorize/authorize.service';
import { InvalidAuthCodeError } from '../authorize/invalid-auth-code.error';
import { KEY_PAIR_SERVICE_PROVIDER } from '../keys/key-pair-service.provider';
import { KeyPair } from '../keys/key-pair.model';
import { KeyPairService } from '../keys/key-pair.service';
import { ExpirationService } from '../util/expiration.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { InvalidGrantError } from './invalid-grant.error';
import { TokenType } from './token-type.enum';
import { ExchangeAuthCodeForTokensDto, TokenResource } from './token.model';

@Injectable()
export class TokenService {
  private readonly accessTokenExpirationTimeInSeconds = 600;
  private readonly idTokenExpirationTimeInSeconds = 600;

  constructor(
    private readonly authorizeService: AuthorizeService,
    private readonly expirationService: ExpirationService,
    @Inject(KEY_PAIR_SERVICE_PROVIDER) private readonly keyPairService: KeyPairService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async exchangeAuthCodeForTokens(exchangeAuthCodeForTokenDto: ExchangeAuthCodeForTokensDto): Promise<TokenResource> {
    try {
      const authCode: AuthCode = await this.authorizeService.exchangeUntrustedAuthCodeForTrustedAuthCode({
        clientId: exchangeAuthCodeForTokenDto.client_id,
        code: exchangeAuthCodeForTokenDto.code,
        redirectUri: exchangeAuthCodeForTokenDto.redirect_uri,
        codeVerifier: exchangeAuthCodeForTokenDto.code_verifier
      });
      const tokens = this.createTokensForAuthCode(authCode);
      await this.authorizeService.consumeAuthCode(authCode.code);
      return tokens;
    } catch (e) {
      if (e instanceof InvalidAuthCodeError || e instanceof AuthCodeNotFoundError) {
        throw new InvalidGrantError(); //TODO: "SHOULD" revoke related access tokens for already consumed auth code
      }
      throw e;
    }
  }

  private async createTokensForAuthCode(authCode: AuthCode): Promise<TokenResource> {
    const keyPair = await this.keyPairService.getKeyPair();
    const tokenResponse: TokenResource = {
      access_token: await this.createSignedAccessTokenJwt(authCode, keyPair),
      scope: this.mapScopesToString(authCode.scopes),
      expires_in: this.accessTokenExpirationTimeInSeconds,
      token_type: TokenType.BEARER
    };
    if (authCode.scopes.includes('openid')) {
      tokenResponse.id_token = await this.createSignedIdTokenJwt(authCode, keyPair);
    }
    return tokenResponse;
  }

  private async createSignedIdTokenJwt(authCode: AuthCode, keyPair: KeyPair): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: keyPair.alg })
      .setIssuedAt()
      .setSubject(authCode.userId)
      .setAudience(authCode.clientId)
      .setExpirationTime(
        this.expirationService.createExpirationDateFromNowAsMillisecondsSinceEpoch({
          seconds: this.idTokenExpirationTimeInSeconds
        })
      )
      .sign(keyPair.privateKey);
  }

  private createSignedAccessTokenJwt(authCode: AuthCode, keyPair: KeyPair): Promise<string> {
    const scope = this.mapScopesToString(authCode.scopes);
    return new SignJWT({ scope })
      .setProtectedHeader({ alg: keyPair.alg })
      .setIssuedAt()
      .setSubject(authCode.userId)
      .setExpirationTime(
        this.expirationService.createExpirationDateFromNowAsMillisecondsSinceEpoch({
          seconds: this.accessTokenExpirationTimeInSeconds
        })
      )
      .sign(keyPair.privateKey);
  }

  private mapScopesToString(scopes: Array<string>) {
    return scopes
      .reduce((previous, current) => {
        return (previous += `${current} `);
      }, '')
      .trim();
  }
}
