import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeysModule } from '../keys/keys.module';
import { UsersModule } from '../users/users.module';
import { AuthenticationService } from './authentication.service';
import { DynamoSessionStore } from './dynamo-session.store';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UsersModule, PassportModule, KeysModule],
  providers: [AuthenticationService, LocalStrategy, SessionSerializer, DynamoSessionStore]
})
export class AuthenticationModule {}
