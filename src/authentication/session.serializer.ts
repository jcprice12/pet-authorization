import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PublicUser } from '../users/user.model';
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
      .getPublicUserById(userId)
      .then((user: PublicUser) => {
        done(null, user);
      })
      .catch((e: Error) => done(e, null));
  }
}
