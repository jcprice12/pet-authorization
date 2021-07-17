import { Module } from '@nestjs/common';
import { UtilModule } from '../util/util.module';
import { ConsentService } from './consent.service';

@Module({
  imports: [UtilModule],
  providers: [ConsentService],
  exports: [ConsentService]
})
export class ConsentModule {}
