import { Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from '../authentication/local-auth.guard';

@Controller('/login')
export class LoginController {
  @Get()
  @Render('login')
  getLoginPage() {
    return {
      afterLoginGoTo: '/authorize?response_type=code&client_id=1234&redirect_uri=https://youtube.com&scope=profile'
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post()
  login(@Res() res: Response) {
    res.send(201);
  }
}
