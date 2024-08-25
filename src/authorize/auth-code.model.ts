import { CodeChallengeMethod } from './code-challenge-method.enum';

export interface AuthCodeBase {
  clientId: string;
  code: string;
  redirectUri?: string;
}

export interface UntrustedAuthCode extends AuthCodeBase {
  codeVerifier?: string;
}

export interface AuthCode extends AuthCodeBase {
  userId: string;
  isConsumed: boolean;
  expires: string;
  scopes: Array<string>;
  codeChallengeMethod: CodeChallengeMethod;
  codeChallenge?: string;
}
