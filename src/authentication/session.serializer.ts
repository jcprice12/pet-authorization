import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PublicUser, UserEntity } from '../user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UserService) {
    super();
  }

  serializeUser(user: PublicUser, done: (err: Error, userId: string) => void) {
    done(null, user.id);
  }

  deserializeUser(userId: string, done: (err: Error, user: PublicUser) => void) {
    this.usersService
      .findOneById(userId)
      .then((user: UserEntity) => {
        const { password, ...publicUser } = user;
        done(null, publicUser);
      })
      .catch((e: Error) => done(e, null));
  }
}
