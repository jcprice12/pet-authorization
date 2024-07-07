export class InvalidRedirectUriError extends Error {
  constructor() {
    super('invalid redirect_uri');
  }
}
