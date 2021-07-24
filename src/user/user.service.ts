import { Injectable } from '@nestjs/common';
import { UserDao } from './user.dao';
import { PublicUser, User, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async getPublicUserById(id: string): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.findOneById(id));
  }

  async registerUser(userRegistrationDto: UserRegistrationDto): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.userDao.insertOne(userRegistrationDto));
  }

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
