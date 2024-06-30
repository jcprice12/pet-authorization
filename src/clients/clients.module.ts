import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsDao } from './clients.dao';
import { ClientsService } from './clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientsDao],
  exports: [ClientsService]
})
export class ClientsModule {}
