export interface UserEntity {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
  id: string;
}

export type PublicUser = Omit<UserEntity, 'password'>;
export type UserRegistrationDto = Omit<UserEntity, 'id'>;
