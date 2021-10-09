export interface AuthCode {
  clientId: string;
  userId: string;
  code: string;
  isConsumed: boolean;
  expires: string;
  scope: Array<string>;
}

export class ValidatableAuthCode implements AuthCode {
  clientId: string;
  userId: string;
  code: string;
  isConsumed: boolean;
  expires: string;
  scope: string[];

  constructor(authCode: AuthCode) {
    Object.assign(this, authCode);
  }
}
