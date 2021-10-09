import { BadRequestException } from '@nestjs/common';

export class InvalidGrantError extends BadRequestException {
  constructor() {
    super({ error: 'invalid_grant' });
  }
}
