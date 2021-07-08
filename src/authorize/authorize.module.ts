import { Module } from '@nestjs/common';
import { AuthorizeController } from './authorize.controller';

@Module({
  controllers: [AuthorizeController]
})
export class AuthorizeModule {}
