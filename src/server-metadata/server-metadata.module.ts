import { Module } from '@nestjs/common';
import { ServerMetadataController } from './server-metadata.controller';
import { ScopeMetadataService } from './scope-metadata.service';
import { ServerMetadataService } from './server-metadata.service';

@Module({
  controllers: [ServerMetadataController],
  providers: [ScopeMetadataService, ServerMetadataService],
  exports: [ScopeMetadataService, ServerMetadataService]
})
export class ServerMetadataModule {}
