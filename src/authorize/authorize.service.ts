import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UsersService } from '../users/users.service';
import { ExpirationService } from '../util/expiration.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedAuthCodeLogAttribute } from '../util/masked-auth-code.log-attribute';
import { AuthorizeDao } from './authorize.dao';
import { AuthCode } from './authorize.model';
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

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result: AuthCode) => new MaskedAuthCodeLogAttribute('result', result)
  })
  async createAuthCode(clientId: string, userId: string, desiredScopes: Array<string>): Promise<AuthCode> {
    const matchingScopes = await this.usersService.getUsersMatchingConsentedScopesForClient(
      userId,
      clientId,
      desiredScopes
    );
    if (!matchingScopes.length) {
      throw new UserDeniedRequestError('user has not provided consent for any desired scopes');
    }
    return this.authorizeDao.insertAuthCode({
      clientId,
      userId,
      scopes: desiredScopes,
      expires: this.expirationService.createExpirationDateFromNow({
        minutes: this.minutesUntilAuthCodeExpires
      }),
      isConsumed: false
    });
  }
}
