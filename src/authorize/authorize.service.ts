import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthorizeService {
  authorize(): Promise<string> {
    return Promise.resolve('code');
  }
}
