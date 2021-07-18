import { Module } from '@nestjs/common';
import { UtilModule } from '../util/util.module';
import { UserController } from './user.controller';
import { UserDao } from './user.dao';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule],
  controllers: [UserController],
  providers: [UserService, UserDao],
  exports: [UserService, UserDao]
})
export class UserModule {}
