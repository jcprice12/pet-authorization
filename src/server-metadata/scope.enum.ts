import { Role } from '../users/role.enum';

const namespace = 'jcpets';

export enum Scope {
  OPEN_ID = 'openid',
  PROFILE = 'profile',
  EMAIL = 'email',
  JCPETS_ROLES = `${namespace}:roles`,
  JCPETS_PETS_WRITE = `${namespace}:pets:write`
}

export const ScopeDescriptions: { [key in Scope]: string } = {
  [Scope.OPEN_ID]: 'Your identity',
  [Scope.PROFILE]: 'Your profile information',
  [Scope.EMAIL]: 'Your email',
  [Scope.JCPETS_ROLES]: `Your roles for ${namespace}`,
  [Scope.JCPETS_PETS_WRITE]: `Create or update pets for ${namespace}`
};

export const ScopeRoles: { [key in Scope]: Array<Role> } = {
  [Scope.OPEN_ID]: [],
  [Scope.PROFILE]: [],
  [Scope.EMAIL]: [],
  [Scope.JCPETS_ROLES]: [],
  [Scope.JCPETS_PETS_WRITE]: [Role.ADMIN]
};
