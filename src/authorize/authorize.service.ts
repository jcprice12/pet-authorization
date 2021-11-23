import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InvalidGrantError } from '../token/invalid-grant.error';
import { UsersService } from '../users/users.service';
import { ExpirationService } from '../util/expiration.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { AuthorizeDao } from './authorize.dao';
import { AuthCode, AuthCodeBase } from './authorize.model';
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
  async exchangeUntrustedAuthCodeForTrustedAuthCode(untrustedAuthCode: AuthCodeBase): Promise<AuthCode> {
    const trustedAuthCode = await this.authorizeDao.findAuthCode(untrustedAuthCode.code);
    this.validateUnstrustedAuthCodeCanBeTrusted(untrustedAuthCode, trustedAuthCode);
    return trustedAuthCode;
  }

  private validateUnstrustedAuthCodeCanBeTrusted(
    untrustedAuthCode: AuthCodeBase,
    trustedAuthCode: AuthCode | undefined
  ): void {
    function doesUntrustedAuthCodeMatchTrustedAuthCode() {
      return (
        untrustedAuthCode.clientId === trustedAuthCode.clientId &&
        untrustedAuthCode.redirectUri === trustedAuthCode.redirectUri
      );
    }
    if (
      !trustedAuthCode ||
      !doesUntrustedAuthCodeMatchTrustedAuthCode() ||
      this.expirationService.isExpired(trustedAuthCode.expires)
    ) {
      throw new InvalidGrantError();
    }
  }

  @LogPromise(retrieveLoggerOnClass)
  async consumeAuthCode(code: string): Promise<void> {
    await this.authorizeDao.updateConsumeFlagForAuthCode(code, true);
  }
}
