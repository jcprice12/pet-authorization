import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UtilModule } from '../util/util.module';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeDao } from './authorize.dao';
import { AuthorizeService } from './authorize.service';

@Module({
  imports: [UserModule, UtilModule],
  controllers: [AuthorizeController],
  providers: [AuthorizeService, AuthorizeDao],
  exports: [AuthorizeService, AuthorizeDao]
})
export class AuthorizeModule {}
