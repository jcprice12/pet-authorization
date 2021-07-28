import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Log } from '../util/log.decorator';
import { UserDao } from './user.dao';
import { PublicUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  constructor(
    private readonly userDao: UserDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  async getPublicUserById(id: string): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.findOneById(id));
  }

  async registerUser(userRegistrationDto: UserRegistrationDto): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.insertOne(userRegistrationDto));
  }

  @Log((target: UserService) => target.logger, {
    logPromise: true
  })
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
