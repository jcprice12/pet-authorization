import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GivenScopes } from '../authentication/given-scopes.decorator';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { HasOneOfTheGivenScopesGuard } from '../authentication/scopes.guard';
import { Scope } from '../server-metadata/scope.enum';
import { UserInfoService } from './user-info.service';
import { UserInfo, UserWithScopes } from './user.model';

@Controller('/userinfo')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get('/')
  @GivenScopes(Scope.OPEN_ID)
  @UseGuards(JwtAuthGuard, HasOneOfTheGivenScopesGuard)
  getUserInfo(@Req() req: Request): UserInfo {
    return this.userInfoService.mapUserWithScopesToUserInfo(req.user as UserWithScopes);
  }
}
