import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersDao } from '../users/users.dao';
import { PublicUser } from '../users/user.model';
import { HashService } from '../util/hash.service';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersDao: UsersDao, private readonly hashService: HashService) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    const user = await this.usersDao.findUserByEmail(email);
    if (await this.hashService.compare(password, user.password)) {
      const { password, ...publicUser } = user;
      return publicUser;
    }
    throw new UnauthorizedException();
  }
}
