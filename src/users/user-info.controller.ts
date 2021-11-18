import { Controller, Get } from '@nestjs/common';
import { UserInfo } from './user.model';

@Controller('/userinfo')
export class UserInfoController {
  @Get('/')
  async getUserInfo(): Promise<UserInfo> {
    return Promise.resolve({ sub: 'foo' });
  }
}
