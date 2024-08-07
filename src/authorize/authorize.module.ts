import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { ServerMetadataModule } from '../server-metadata/server-metadata.module';
import { UsersModule } from '../users/users.module';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeDao } from './authorize.dao';
import { AuthorizeService } from './authorize.service';
import { RedirectService } from './redirect.service';

@Module({
  imports: [UsersModule, ClientsModule, ServerMetadataModule],
  controllers: [AuthorizeController],
  providers: [AuthorizeService, AuthorizeDao, RedirectService],
  exports: [AuthorizeService]
})
export class AuthorizeModule {}
