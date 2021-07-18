import { Body, Controller, Get, Post, Query, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { UserDao } from './user.dao';
import { ClientInfoForUser, UserRegistrationDto } from './user.model';

@Controller('/user')
export class UserController {
  constructor(private readonly userDao: UserDao) {}

  @Get('/login')
  @Render('login-user')
  getUserLoginPage(@Query('redirect_uri') redirectUri?: string) {
    return {
      afterLoginGoTo: redirectUri
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  loginUser(@Res() res: Response) {
    res.sendStatus(201);
  }

  @Get('/register')
  @Render('register-user')
  getUserRegistrationPage() {
    return {};
  }

  @Post('/register')
  async registerUser(@Body() user: UserRegistrationDto, @Res() res: Response) {
    await this.userDao.insertOne(user);
    res.sendStatus(201);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('consent')
  @Render('user-consent')
  getUserConsentPage(@Query('redirect_uri') redirectUri?: string) {
    return {
      afterConsentGoTo: redirectUri
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('consent')
  async provideConsent(@Body() consentedScopesForUser: ClientInfoForUser, @Res() res: Response) {
    res.send(201);
  }
}
