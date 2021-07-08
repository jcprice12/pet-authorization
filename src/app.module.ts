import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { LoginModule } from './login/login.module';
import { UsersModule } from './users/users.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [AuthorizeModule, LoginModule, UtilModule, UsersModule, AuthenticationModule]
})
export class AppModule {}
