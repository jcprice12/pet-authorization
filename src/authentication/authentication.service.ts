import { Injectable } from '@nestjs/common';
import { PublicUser } from '../user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(private usersService: UserService) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    const user = await this.usersService.findOneByEmail(email);
    if (user?.password === password) {
      const { password, ...publicUser } = user;
      return publicUser;
    }
    return null;
  }
}
