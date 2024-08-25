import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { ScopeMetadataService } from '../server-metadata/scope-metadata.service';
import { UsersService } from '../users/users.service';
import { ExpirationService } from '../util/expiration.service';
import { HashService } from '../util/hash.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { AuthCode, AuthCodeBase, UntrustedAuthCode } from './auth-code.model';
import { AuthorizeDao } from './authorize.dao';
import { CodeChallengeMethod } from './code-challenge-method.enum';
import { InvalidAuthCodeError } from './invalid-auth-code.error';
import { UserDeniedRequestError } from './user-denied-request.error';

@Injectable()
export class AuthorizeService {
  private readonly minutesUntilAuthCodeExpires = 10;

  constructor(
    private readonly authorizeDao: AuthorizeDao,
    private readonly usersService: UsersService,
    private readonly expirationService: ExpirationService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly hashService: HashService,
    private readonly scopeMetadataService: ScopeMetadataService
  ) {}

  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass)
  async attemptToCreateAuthCode(
    clientId: string,
    userId: string,
    codeChallengeMethod: CodeChallengeMethod,
    redirectUri?: string,
    desiredScopes?: Array<string>,
    codeChallenge?: string
  ): Promise<AuthCode> {
    desiredScopes = desiredScopes ?? this.scopeMetadataService.getAllSupportedScopes();
    const matchingScopes = await this.usersService.getConsentedScopesByUserAndClient(userId, clientId, desiredScopes);
    if (!matchingScopes.length) {
      throw new UserDeniedRequestError('user has not provided consent for any of the desired scopes');
    }
    return this.authorizeDao.insertAuthCode({
      code: uuidv4(),
      clientId,
      userId,
      scopes: matchingScopes,
      expires: this.expirationService.createExpirationDateFromNowAsIsoString({
        minutes: this.minutesUntilAuthCodeExpires
      }),
      isConsumed: false,
      redirectUri,
      codeChallengeMethod,
      codeChallenge
    });
  }

  @LogPromise(retrieveLoggerOnClass)
  getAuthCode(code: string): Promise<AuthCode> {
    return this.authorizeDao.findAuthCode(code);
  }

  @LogPromise(retrieveLoggerOnClass)
  async exchangeUntrustedAuthCodeForTrustedAuthCode(untrustedAuthCode: UntrustedAuthCode): Promise<AuthCode> {
    const trustedAuthCode = await this.getAuthCode(untrustedAuthCode.code);
    this.validateCodeVerifierMatchesCodeChallenge(untrustedAuthCode, trustedAuthCode);
    this.validateAuthCodeIssuedToSameClient(untrustedAuthCode, trustedAuthCode);
    this.validateRedirectUriMatches(untrustedAuthCode, trustedAuthCode);
    this.validateAuthCodeHasNotExpired(trustedAuthCode);
    this.validateAuthCodeHasNotBeenConsumed(trustedAuthCode);
    return trustedAuthCode;
  }

  @LogPromise(retrieveLoggerOnClass)
  async consumeAuthCode(code: string): Promise<void> {
    await this.authorizeDao.updateAuthCode({ code, isConsumed: true });
  }

  private validateCodeVerifierMatchesCodeChallenge(untrustedAuthCode: UntrustedAuthCode, trustedAuthCode: AuthCode) {
    if (
      trustedAuthCode.codeChallenge &&
      (!untrustedAuthCode.codeVerifier ||
        (trustedAuthCode.codeChallengeMethod === CodeChallengeMethod.S256 &&
          this.hashService.sha256(untrustedAuthCode.codeVerifier) !== trustedAuthCode.codeChallenge) ||
        (trustedAuthCode.codeChallengeMethod === CodeChallengeMethod.PLAIN &&
          untrustedAuthCode.codeVerifier !== trustedAuthCode.codeChallenge))
    ) {
      throw new InvalidAuthCodeError();
    }
  }

  private validateAuthCodeIssuedToSameClient(untrustedAuthCode: AuthCodeBase, trustedAuthCode: AuthCode): void {
    if (untrustedAuthCode.clientId !== trustedAuthCode.clientId) {
      throw new InvalidAuthCodeError();
    }
  }

  private validateAuthCodeHasNotExpired(trustedAuthCode: AuthCode): void {
    if (this.expirationService.isExpired(trustedAuthCode.expires)) {
      throw new InvalidAuthCodeError();
    }
  }

  private validateAuthCodeHasNotBeenConsumed(trustedAuthCode: AuthCode): void {
    if (trustedAuthCode.isConsumed) {
      throw new InvalidAuthCodeError();
    }
  }

  private validateRedirectUriMatches(untrustedAuthCode: AuthCodeBase, trustedAuthCode: AuthCode): void {
    if (trustedAuthCode.redirectUri && untrustedAuthCode.redirectUri !== trustedAuthCode.redirectUri) {
      throw new InvalidAuthCodeError();
    }
  }
}
