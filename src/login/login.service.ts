import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginService {
  login(): void {
    console.log('hello world');
  }
}
