import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UsersService } from '../users/users.service';
import { ExpirationService } from '../util/expiration.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { AuthCodeNotFoundError } from './auth-code-not-found.error';
import { AuthorizeDao } from './authorize.dao';
import { AuthCode, AuthCodeBase } from './authorize.model';
import { AuthCodeConsumedError, AuthCodeExpiredError, AuthCodeUntrustedError } from './invalid-auth-code.error';
import { UserDeniedRequestError } from './user-denied-request.error';

@Injectable()
export class AuthorizeService {
  private readonly minutesUntilAuthCodeExpires = 10;

  constructor(
    private readonly authorizeDao: AuthorizeDao,
    private readonly usersService: UsersService,
    private readonly expirationService: ExpirationService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass)
  async createAuthCode(
    clientId: string,
    userId: string,
    desiredScopes: Array<string>,
    redirectUri: string
  ): Promise<AuthCode> {
    const matchingScopes = await this.usersService.getConsentedScopesByUserAndClient(userId, clientId, desiredScopes);
    if (!matchingScopes.length) {
      throw new UserDeniedRequestError('user has not provided consent for any desired scopes');
    }
    return this.authorizeDao.insertAuthCode({
      clientId,
      userId,
      scopes: desiredScopes,
      expires: this.expirationService.createExpirationDateFromNowAsIsoString({
        minutes: this.minutesUntilAuthCodeExpires
      }),
      isConsumed: false,
      redirectUri
    });
  }

  @LogPromise(retrieveLoggerOnClass)
  async getAuthCode(code: string): Promise<AuthCode> {
    const authCode: AuthCode = await this.authorizeDao.findAuthCode(code);
    if (!authCode) {
      throw new AuthCodeNotFoundError();
    }
    return authCode;
  }

  @LogPromise(retrieveLoggerOnClass)
  async exchangeUntrustedAuthCodeForTrustedAuthCode(untrustedAuthCode: AuthCodeBase): Promise<AuthCode> {
    const trustedAuthCode = await this.getAuthCode(untrustedAuthCode.code);
    this.validateUntrustedAuthCodeMatchesTrustedAuthCode(untrustedAuthCode, trustedAuthCode);
    this.validateAuthCodeHasNotExpired(trustedAuthCode);
    this.validateAuthCodeHasNotBeenConsumed(trustedAuthCode);
    return trustedAuthCode;
  }

  @LogPromise(retrieveLoggerOnClass)
  async consumeAuthCode(code: string): Promise<void> {
    await this.authorizeDao.updateAuthCode({ code, isConsumed: true });
  }

  private validateUntrustedAuthCodeMatchesTrustedAuthCode(
    untrustedAuthCode: AuthCodeBase,
    trustedAuthCode: AuthCode
  ): void {
    if (
      untrustedAuthCode.clientId === trustedAuthCode.clientId &&
      untrustedAuthCode.redirectUri === trustedAuthCode.redirectUri
    ) {
      throw new AuthCodeUntrustedError();
    }
  }

  private validateAuthCodeHasNotExpired(authCode: AuthCode): void {
    if (this.expirationService.isExpired(authCode.expires)) {
      throw new AuthCodeExpiredError();
    }
  }

  private validateAuthCodeHasNotBeenConsumed(authCode: AuthCode): void {
    if (authCode.isConsumed) {
      throw new AuthCodeConsumedError();
    }
  }
}
