import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [new transports.Console({ format: format.json() })]
    }),
    AuthorizeModule,
    UtilModule,
    UserModule,
    AuthenticationModule
  ]
})
export class AppModule {}
