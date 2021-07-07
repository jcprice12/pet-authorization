import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { SessionService } from '../common/session.service';
import { LoginDto } from './login.dto';

@Controller('/login')
export class LoginController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @Render('login')
  getLoginPage() {
    console.log('trying to get login page');
    return {
      afterLoginGoTo: '/authorize?response_type=code&client_id=1234&redirect_uri=https://youtube.com&scope=profile'
    };
  }

  @Post()
  login(@Body() creds: LoginDto, @Res() res: Response) {
    console.log('trying to login');
    const sessionId = this.sessionService.createSession(creds.username);
    res.cookie('PETSESH', sessionId, { httpOnly: true });
    res.send(201);
  }
}
