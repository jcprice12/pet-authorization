interface UserBase {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}
export interface DbUser extends UserBase {
  pk: string;
}
export interface User extends UserBase {
  id: string;
}
export type PublicUser = Omit<User, 'password'>;
export type UserRegistrationDto = Omit<User, 'id'>;
