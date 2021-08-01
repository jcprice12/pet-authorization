import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDao } from '../user/user.dao';
import { PublicUser } from '../user/user.model';
import { HashService } from '../util/hash.service';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userDao: UserDao, private readonly hashService: HashService) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    const user = await this.userDao.findUserByEmail(email);
    if (await this.hashService.compare(password, user.password)) {
      const { password, ...publicUser } = user;
      return publicUser;
    }
    throw new UnauthorizedException();
  }
}
