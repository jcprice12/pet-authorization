const namespace = 'jcpets';

export enum Scope {
  OPEN_ID = 'openid',
  EMAIL = 'email',
  JCPETS_ROLES = `${namespace}.roles`
}

export const ScopeDescriptions: { [key in Scope]: string } = {
  [Scope.OPEN_ID]: 'Your ID',
  [Scope.EMAIL]: 'Your email',
  [Scope.JCPETS_ROLES]: 'Your roles'
};
