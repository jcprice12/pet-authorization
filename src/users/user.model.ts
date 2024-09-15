import { Scope } from '../server-metadata/scope.enum';
import { Role } from './role.enum';

interface UserBase {
  email: string;
  given_name: string;
  family_name: string;
}

/**
 * User model without password
 */
export interface PublicUser extends UserBase {
  id: string;
  roles: Array<Role>;
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
 * OIDC user info claims.
 */
export interface UserInfo {
  sub: string;
  given_name: string;
  family_name: string;
  email?: string;
  [Scope.JCPETS_ROLES]?: Array<Role>;
}

/**
 * User's relationship to client - E.G. consented scopes client can use
 */
export interface ClientInfoForUser {
  userId: string;
  clientId: string;
  scopes: Array<Scope>;
}

export interface UserWithScopes extends PublicUser {
  scopes: Array<Scope>;
}
