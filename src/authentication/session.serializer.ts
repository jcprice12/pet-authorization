import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PublicUser } from '../user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: PublicUser, done: (err: Error, userId: string) => void) {
    done(null, user.id);
  }

  deserializeUser(userId: string, done: (err: Error, user: PublicUser) => void) {
    this.userService
      .getPublicUserById(userId)
      .then((user: PublicUser) => {
        done(null, user);
      })
      .catch((e: Error) => done(e, null));
  }
}
