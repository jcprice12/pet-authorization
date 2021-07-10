import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity, UserRegistrationDto } from './user.model';

@Injectable()
export class UserService {
  private readonly users: Array<UserEntity> = [];

  findOneByEmail(email: string): Promise<UserEntity | undefined> {
    return Promise.resolve(this.users.find((user) => user.email === email));
  }

  findOneById(id: string): Promise<UserEntity | undefined> {
    return Promise.resolve(this.users.find((user) => user.id === id));
  }

  async register(user: UserRegistrationDto): Promise<void> {
    if (await this.findOneByEmail(user.email)) {
      throw new UnprocessableEntityException('user exists with that email');
    }
    const newUser: UserEntity = {
      ...user,
      id: uuidv4()
    };
    this.users.push(newUser);
  }
}
