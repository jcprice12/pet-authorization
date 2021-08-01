import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserService } from '../user/user.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { AuthorizeDao } from './authorize.dao';
import { AuthCode } from './authorize.model';
import { UserDeniedRequestError } from './user-denied-request.error';

@Injectable()
export class AuthorizeService {
  private readonly authCodeExpirationTimeInMilliseconds = 600000;

  constructor(
    private readonly authorizeDao: AuthorizeDao,
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async createAuthCode(
    clientId: string,
    userId: string,
    desiredScope: Array<string>
  ): Promise<AuthCode> {
    const matchingScopes = await this.userService.getUsersMatchingConsentedScopesForClient(
      userId,
      clientId,
      desiredScope
    );
    if (!matchingScopes.length) {
      throw new UserDeniedRequestError('user has not provided consent for any desired scopes');
    }
    return this.authorizeDao.insertAuthCode({
      clientId,
      userId,
      scope: desiredScope,
      expires: new Date(Date.now() + this.authCodeExpirationTimeInMilliseconds).toISOString(),
      isConsumed: false
    });
  }
}
