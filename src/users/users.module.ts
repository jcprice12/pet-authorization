import { Module } from '@nestjs/common';
import { UserInfoController } from './user-info.controller';
import { UserInfoService } from './user-info.service';
import { UsersController } from './users.controller';
import { UsersDao } from './users.dao';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UserInfoController],
  providers: [UsersService, UsersDao, UserInfoService],
  exports: [UsersService, UsersDao]
})
export class UsersModule {}
