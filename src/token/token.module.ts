import { Module } from '@nestjs/common';
import { AuthorizeModule } from '../authorize/authorize.module';
import { KeysModule } from '../keys/keys.module';
import { ServerMetadataModule } from '../server-metadata/server-metadata.module';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthorizeModule, KeysModule, ServerMetadataModule, UsersModule],
  controllers: [TokenController],
  providers: [TokenService]
})
export class TokenModule {}
