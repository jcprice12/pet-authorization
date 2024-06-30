import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

@Injectable()
export class HashService {
  private readonly sha256Hash = createHash('sha256');

  hashWithSalt(value: string, saltRounds = 10): Promise<string> {
    return bcrypt.hash(value, saltRounds);
  }

  compare(plainText: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedValue);
  }

  sha256(value: string): string {
    return this.sha256Hash.update(value).digest('base64url');
  }
}
