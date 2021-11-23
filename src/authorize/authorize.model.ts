export interface AuthCodeBase {
  clientId: string;
  code: string;
  redirectUri: string;
}

export interface AuthCode extends AuthCodeBase {
  userId: string;
  isConsumed: boolean;
  expires: string;
  scopes: Array<string>;
}
