import { Module } from '@nestjs/common';
import { AuthorizeModule } from '../authorize/authorize.module';
import { KeysModule } from '../keys/keys.module';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [AuthorizeModule, KeysModule],
  controllers: [TokenController],
  providers: [TokenService]
})
export class TokenModule {}
