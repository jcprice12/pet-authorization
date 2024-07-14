import { Injectable } from '@nestjs/common';
import { Scope } from '../server-metadata/scope.enum';
import { UserInfo, UserWithScopes } from './user.model';

@Injectable()
export class UserInfoService {
  mapUserWithScopesToUserInfo(user: UserWithScopes): UserInfo {
    const userInfo: UserInfo = {
      given_name: user.given_name,
      family_name: user.family_name,
      sub: user.id
    };
    if (user.scopes.includes(Scope.EMAIL)) {
      userInfo.email = user.email;
    }
    if (user.scopes.includes(Scope.JCPETS_ROLES)) {
      userInfo[Scope.JCPETS_ROLES] = user.roles;
    }
    return userInfo;
  }
}
