import { Body, Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { ConsentedScopesForUserDto, UserRegistrationDto } from './user.model';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/login')
  @Render('login-user')
  getUserLoginPage() {
    return {
      afterLoginGoTo:
        '/authorize?response_type=code&client_id=1234&redirect_uri=https://youtube.com&scope=profile'
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
    await this.userService.insertOne(user);
    res.sendStatus(201);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('consent')
  @Render('user-consent')
  getUserConsentPage() {
    return {
      afterConsentGoTo:
        '/authorize?response_type=code&client_id=1234&redirect_uri=https://youtube.com&scope=profile'
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('consent')
  async provideConsent(
    @Body() consentedScopesForUser: ConsentedScopesForUserDto,
    @Res() res: Response
  ) {
    res.send(201);
  }
}
