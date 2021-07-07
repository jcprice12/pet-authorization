import { Module } from '@nestjs/common';
import { RequiredPipe } from './required.pipe';
import { SessionService } from './session.service';

@Module({
  providers: [RequiredPipe, SessionService],
  exports: [RequiredPipe, SessionService]
})
export class CommonModule {}
