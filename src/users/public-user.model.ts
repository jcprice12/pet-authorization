import { User } from './user.model';

export type PublicUser = Omit<User, 'password'>;
