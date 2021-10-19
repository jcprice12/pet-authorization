import { Injectable } from '@nestjs/common';
import { DateTime, DurationLike } from 'luxon';

@Injectable()
export class ExpirationService {
  createExpirationDateFromNow(duration: DurationLike): DateTime {
    return DateTime.utc().plus(duration);
  }

  createExpirationDateFromNowAsMillisecondsSinceEpoch(duration: DurationLike): number {
    return DateTime.utc().plus(duration).toMillis();
  }

  createExpirationDateFromNowAsIsoString(duration: DurationLike): string {
    return this.createExpirationDateFromNow(duration).toISO();
  }

  isExpired(iso: string): boolean {
    const expirationDateTime = DateTime.fromISO(iso);
    const now = DateTime.utc();
    return expirationDateTime < now;
  }
}
