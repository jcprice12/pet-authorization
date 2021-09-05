import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeDao } from './authorize.dao';
import { AuthorizeService } from './authorize.service';
import { RedirectService } from './redirect.service';

@Module({
  imports: [UserModule],
  controllers: [AuthorizeController],
  providers: [AuthorizeService, AuthorizeDao, RedirectService]
})
export class AuthorizeModule {}
