interface UserBase {
  email: string;
  givenName: string;
  familyName: string;
}
export interface PublicUser extends UserBase {
  id: string;
}
export interface User extends PublicUser {
  password: string;
}
export interface UserRegistrationDto extends UserBase {
  password: string;
}
export interface ClientInfoForUser {
  userId: string;
  clientId: string;
  scopes: Array<string>;
}
