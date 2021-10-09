import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { UsersModule } from './users/users.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [new transports.Console({ format: format.json() })]
    }),
    AuthorizeModule,
    UtilModule,
    UsersModule,
    AuthenticationModule
  ]
})
export class AppModule {}
