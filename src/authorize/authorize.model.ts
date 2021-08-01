export interface AuthCode {
  clientId: string;
  userId: string;
  code: string;
  isConsumed: boolean;
  expires: string;
  scope: Array<string>;
}
