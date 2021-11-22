import { Controller, Get } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfo } from './user.model';

@Controller('/userinfo')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get('/')
  async getUserInfo(): Promise<UserInfo> {
    return this.userInfoService.getScopedUserInfoForUser('foo', []);
  }
}
