import { Module } from '@nestjs/common';
import { RequiredPipe } from './required.pipe';

@Module({
  providers: [RequiredPipe],
  exports: [RequiredPipe]
})
export class CommonModule {}
