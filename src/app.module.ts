import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { ClientsModule } from './clients/clients.module';
import { KeysModule } from './keys/keys.module';
import { ServerMetadataModule } from './server-metadata/server-metadata.module';
import { TokenModule } from './token/token.module';
import { UsersModule } from './users/users.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    WinstonModule.forRoot({
      transports: [new transports.Console({ format: format.json() })]
    }),
    KeysModule,
    TokenModule,
    AuthorizeModule,
    UtilModule,
    UsersModule,
    ClientsModule,
    AuthenticationModule,
    ServerMetadataModule
  ]
})
export class AppModule {}
