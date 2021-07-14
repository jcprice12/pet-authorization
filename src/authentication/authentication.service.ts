import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PublicUser } from '../user/user.model';
import { UserService } from '../user/user.service';
import { HashService } from '../util/hash.service';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UserService, private readonly hashService: HashService) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    const user = await this.usersService.findOneByEmail(email);
    if (await this.hashService.compare(password, user.password)) {
      const { password, ...publicUser } = user;
      return publicUser;
    }
    throw new UnauthorizedException();
  }
}
