import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PublicUser } from '../users/user.model';
import { UsersDao } from '../users/users.dao';
import { UsersService } from '../users/users.service';
import { HashService } from '../util/hash.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersDao: UsersDao,
    private readonly hashService: HashService
  ) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    try {
      const user = await this.usersDao.findUserByEmail(email);
      if (await this.hashService.compare(password, user.password)) {
        return this.usersService.mapUserToPublicUser(user);
      }
    } catch (e) {
      // do nothing
    }
    throw new UnauthorizedException();
  }
}
