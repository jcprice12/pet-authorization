import { Module } from '@nestjs/common';
import { AuthorizeModule } from '../authorize/authorize.module';
import { TokenController } from './token.controller';
import { TokenDao } from './token.dao';
import { TokenService } from './token.service';

@Module({
  imports: [AuthorizeModule],
  controllers: [TokenController],
  providers: [TokenService, TokenDao]
})
export class TokenModule {}
