import { Module } from '@nestjs/common';
import { keyPairServiceProvider } from './key-pair-service.provider';
import { KeysController } from './keys.controller';
import { KeysService } from './keys.service';

@Module({
  controllers: [KeysController],
  providers: [KeysService, keyPairServiceProvider],
  exports: [KeysService, keyPairServiceProvider]
})
export class KeysModule {}
