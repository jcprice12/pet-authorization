import { Injectable } from '@nestjs/common';
import { UserInfo } from './user.model';

@Injectable()
export class UserInfoService {
  getScopedUserInfoForUser(userId: string, _scopes: Array<string>): Promise<UserInfo> {
    return Promise.resolve({ sub: userId });
  }
}
