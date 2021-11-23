import { Controller, Get, UseGuards } from '@nestjs/common';
import { GivenScopes } from '../authentication/given-scopes.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { HasOneOfTheGivenScopesGuard } from '../authentication/scopes.guard';
import { UserInfoService } from './user-info.service';
import { UserInfo } from './user.model';

@Controller('/userinfo')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get('/')
  @GivenScopes('openid')
  @UseGuards(JwtAuthGuard, HasOneOfTheGivenScopesGuard)
  async getUserInfo(): Promise<UserInfo> {
    return this.userInfoService.getScopedUserInfoForUser('foo', []);
  }
}
