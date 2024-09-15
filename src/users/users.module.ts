import { Module } from '@nestjs/common';
import { ServerMetadataModule } from '../server-metadata/server-metadata.module';
import { UserInfoController } from './user-info.controller';
import { UserInfoService } from './user-info.service';
import { UsersController } from './users.controller';
import { UsersDao } from './users.dao';
import { UsersService } from './users.service';

@Module({
  imports: [ServerMetadataModule],
  controllers: [UsersController, UserInfoController],
  providers: [UsersService, UsersDao, UserInfoService],
  exports: [UsersService, UsersDao, UserInfoService]
})
export class UsersModule {}
