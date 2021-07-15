import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { UtilModule } from '../util/util.module';
import { AuthenticationService } from './authentication.service';
import { DynamoSessionStore } from './dynamo-session.store';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule, PassportModule, UtilModule],
  providers: [AuthenticationService, LocalStrategy, SessionSerializer, DynamoSessionStore]
})
export class AuthenticationModule {}
