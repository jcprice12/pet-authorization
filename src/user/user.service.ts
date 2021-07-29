import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Log, LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedPasswordLogAttribute } from '../util/masked-password.log-attribute';
import { UserDao } from './user.dao';
import { PublicUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  constructor(
    private readonly userDao: UserDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async getPublicUserById(id: string): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.findOneById(id));
  }

  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(arg: UserRegistrationDto) => new MaskedPasswordLogAttribute('arg1', arg)]
  })
  async registerUser(userRegistrationDto: UserRegistrationDto): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.insertOne(userRegistrationDto));
  }

  @Log(retrieveLoggerOnClass, { logPromise: true })
  async getUsersMatchingConsentedScopesForClient(
    userId: string,
    clientId: string,
    scopes: Array<string>
  ) {
    const clientInfoForUser = await this.userDao.findClientInfoForUser(userId, clientId);
    return scopes.filter((scope) => clientInfoForUser.scopes.includes(scope));
  }

  private mapUserToPublicUser(user: User): PublicUser {
    const { password, ...everythingElse } = user;
    return everythingElse;
  }
}
