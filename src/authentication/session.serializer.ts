import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PublicUser } from '../users/public-user.model';
import { User } from '../users/user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: PublicUser, done: (err: Error, userId: string) => void) {
    done(null, user.id);
  }

  deserializeUser(userId: string, done: (err: Error, user: PublicUser) => void) {
    this.usersService
      .findOneById(userId)
      .then((user: User) => done(null, { id: user.id, username: user.username }))
      .catch((e: Error) => done(e, null));
  }
}
