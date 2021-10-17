import { Provider } from '@nestjs/common';
import { LocalKeyPairService } from './local-key-pair.service';

export const KEY_PAIR_SERVICE_PROVIDER = 'KEY_PAIR_SERVICE_PROVIDER';

export const keyPairServiceProvider: Provider = {
  provide: KEY_PAIR_SERVICE_PROVIDER,
  useClass: LocalKeyPairService
};
