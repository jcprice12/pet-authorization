export class InvalidAuthCodeError extends Error {}
export class AuthCodeExpiredError extends InvalidAuthCodeError {}
export class AuthCodeConsumedError extends InvalidAuthCodeError {}
export class AuthCodeUntrustedError extends InvalidAuthCodeError {}
