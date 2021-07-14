import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { UtilModule } from '../util/util.module';
import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule, PassportModule, UtilModule],
  providers: [AuthenticationService, LocalStrategy, SessionSerializer]
})
export class AuthenticationModule {}
