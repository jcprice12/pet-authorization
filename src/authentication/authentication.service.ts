import { Injectable } from '@nestjs/common';
import { PublicUser } from '../users/public-user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<PublicUser> {
    const user = await this.usersService.findOneByUsername(username);
    return user?.password === password ? { id: user.id, username: user.username } : null;
  }
}
