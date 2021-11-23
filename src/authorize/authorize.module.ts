import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeDao } from './authorize.dao';
import { AuthorizeService } from './authorize.service';
import { RedirectService } from './redirect.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthorizeController],
  providers: [AuthorizeService, AuthorizeDao, RedirectService],
  exports: [AuthorizeService]
})
export class AuthorizeModule {}
