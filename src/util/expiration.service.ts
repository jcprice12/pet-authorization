import { Injectable } from '@nestjs/common';
import { DateTime, DurationLike } from 'luxon';

@Injectable()
export class ExpirationService {
  createExpirationDateFromNow(duration: DurationLike): string {
    return DateTime.utc().plus(duration).toISO();
  }

  isExpired(iso: string): boolean {
    const expirationDateTime = DateTime.fromISO(iso);
    const now = DateTime.utc();
    return expirationDateTime < now;
  }
}
