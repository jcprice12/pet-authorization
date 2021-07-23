import { Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { PublicUser } from './user.model';

@Injectable()
export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async getPublicUserById(id: string): Promise<PublicUser> {
    const { password, ...everythingElse } = await this.userDao.findOneById(id);
    return everythingElse;
  }

  async getUsersMatchingConsentedScopesForClient(
    userId: string,
    clientId: string,
    scopes: Array<string>
  ) {
    const clientInfoForUser = await this.userDao.findClientInfoForUser(userId, clientId);
    return scopes.filter((scope) => clientInfoForUser.scopes.includes(scope));
  }
}
