import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthorizeController } from './authorize.controller';

@Module({
  imports: [UserModule],
  controllers: [AuthorizeController]
})
export class AuthorizeModule {}
