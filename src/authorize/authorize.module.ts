import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeService } from './authorize.service';

@Module({
  imports: [CommonModule],
  controllers: [AuthorizeController],
  providers: [AuthorizeService]
})
export class AuthorizeModule {}
