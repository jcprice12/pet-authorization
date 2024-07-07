export class InvalidClientIdError extends Error {
  constructor() {
    super('invalid client_id');
  }
}
