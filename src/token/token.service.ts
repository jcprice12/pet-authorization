import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JWTPayload, SignJWT } from 'jose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthCode } from '../authorize/auth-code.model';
import { AuthorizeService } from '../authorize/authorize.service';
import { InvalidAuthCodeError } from '../authorize/invalid-auth-code.error';
import { KEY_PAIR_SERVICE_PROVIDER } from '../keys/key-pair-service.provider';
import { KeyPairService } from '../keys/key-pair.service';
import { ScopeMetadataService } from '../server-metadata/scope-metadata.service';
import { Scope } from '../server-metadata/scope.enum';
import { ServerMetadataService } from '../server-metadata/server-metadata.service';
import { UserInfoService } from '../users/user-info.service';
import { UsersService } from '../users/users.service';
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
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly scopeMetadataService: ScopeMetadataService,
    private readonly serverMetadataService: ServerMetadataService,
    private readonly usersService: UsersService,
    private readonly userInfoService: UserInfoService
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
      // note: because I am implementing tokens as JWT's and not saving them in DB for lookup later, I cannot revoke them for invalid auth code
      if (e instanceof InvalidAuthCodeError || e instanceof NotFoundException) {
        throw new InvalidGrantError();
      }
      throw e;
    }
  }

  private async createTokensForAuthCode(authCode: AuthCode): Promise<TokenResource> {
    const keyPair = await this.keyPairService.getKeyPair();
    const createBase = (payload: JWTPayload): SignJWT => {
      const nowInSeconds = Date.now() / 1000;
      const metadata = this.serverMetadataService.getServerMetadata();
      return new SignJWT(payload)
        .setProtectedHeader({ alg: keyPair.alg, kid: keyPair.kid, jku: metadata.jwks_uri })
        .setIssuer(metadata.issuer)
        .setIssuedAt(nowInSeconds)
        .setNotBefore(nowInSeconds)
        .setSubject(authCode.userId)
        .setExpirationTime(
          this.expirationService.createExpirationDateFromNowAsSecondsSinceEpoch({
            seconds: this.idTokenExpirationTimeInSeconds
          })
        );
    };
    const createAccessToken = (): Promise<string> => {
      const scope = this.scopeMetadataService.mapScopesToString(authCode.scopes);
      return createBase({ scope }).sign(keyPair.privateKey);
    };
    const createIdToken = async (): Promise<string> => {
      const user = await this.usersService.getPublicUserById(authCode.userId);
      const userInfo = this.userInfoService.mapUserWithScopesToUserInfo({ ...user, scopes: authCode.scopes });
      return createBase(userInfo as unknown as JWTPayload)
        .setAudience(authCode.clientId)
        .sign(keyPair.privateKey);
    };
    const tokenResponse: TokenResource = {
      access_token: await createAccessToken(),
      scope: this.scopeMetadataService.mapScopesToString(authCode.scopes),
      expires_in: this.accessTokenExpirationTimeInSeconds,
      token_type: TokenType.BEARER
    };
    if (authCode.scopes.includes(Scope.OPEN_ID)) {
      tokenResponse.id_token = await createIdToken();
    }
    return tokenResponse;
  }
}
