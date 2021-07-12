import { Module } from '@nestjs/common';
import { UtilModule } from '../util/util.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
