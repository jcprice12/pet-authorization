import { Controller, Post } from '@nestjs/common';

@Controller('/token')
export class TokenController {
  @Post('/')
  async createToken() {}
}
