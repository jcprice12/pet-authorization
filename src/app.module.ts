import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { ConsentModule } from './consent/consent.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [AuthorizeModule, UtilModule, UserModule, AuthenticationModule, ConsentModule]
})
export class AppModule {}
