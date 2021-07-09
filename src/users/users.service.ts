import { Injectable } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UsersService {
  private readonly users: Array<User> = [
    {
      id: '1',
      username: 'john',
      password: 'changeme'
    },
    {
      id: '2',
      username: 'maria',
      password: 'guess'
    }
  ];

  findOneByUsername(username: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.username === username));
  }

  findOneById(id: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.id === id));
  }
}
