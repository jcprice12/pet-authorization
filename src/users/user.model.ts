interface UserBase {
  email: string;
  givenName: string;
  familyName: string;
}
/**
 * User model without password
 */
export interface PublicUser extends UserBase {
  id: string;
}
/**
 * Base user model that is closest to representation in DB
 * Password is encrypted and salted
 */
export interface User extends PublicUser {
  password: string;
}
/**
 * User to be registered
 * Password is in plain text - be careful
 */
export interface UserRegistrationDto extends UserBase {
  password: string;
}
/**
 * OIDC user info.
 * The spec provides a non-normative example with snake case. Because I am lazy and it is only a suggestion to use snake-case, I am using camel case
 */
export interface UserInfo {
  sub: string;
  email?: string;
  givenName?: string;
  familyName?: string;
}
/**
 * User's relationship to client - E.G. consented scopes client can use
 */
export interface ClientInfoForUser {
  userId: string;
  clientId: string;
  scopes: Array<string>;
}
