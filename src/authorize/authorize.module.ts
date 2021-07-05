import { Module } from '@nestjs/common';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeService } from './authorize.service';

@Module({
  controllers: [AuthorizeController],
  providers: [AuthorizeService]
})
export class AuthorizeModule {}
