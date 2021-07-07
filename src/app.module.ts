import { Module } from '@nestjs/common';
import { AuthorizeModule } from './authorize/authorize.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [AuthorizeModule, LoginModule]
})
export class AppModule {}
