import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  Render,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { RequiredPipe } from '../util/required.pipe';
import { UserDao } from './user.dao';
import { PublicUser, UserRegistrationDto } from './user.model';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly userDao: UserDao) {}

  @Get('/login')
  @Render('login-user')
  getUserLoginPage(@Query('redirect_uri', RequiredPipe) redirectUri: string) {
    return {
      afterLoginGoTo: redirectUri
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  loginUser() {}

  @Get('/register')
  @Render('register-user')
  getUserRegistrationPage() {}

  @Post('/register')
  registerUser(@Body() user: UserRegistrationDto) {
    return this.userService.registerUser(user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('consent')
  @Render('user-consent')
  getUserConsentPage(
    @Query('redirect_uri', RequiredPipe) redirectUri: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scopes: Array<string>,
    @Query('client_id', RequiredPipe) clientId: string
  ) {
    return {
      afterConsentGoTo: redirectUri,
      scopes,
      clientId
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('consent')
  async provideConsent(
    @Req() req: Request,
    @Body() consentedScopesForUser: { scopes: Array<string>; clientId: string }
  ) {
    const user = req.user as PublicUser;
    return this.userDao.updateClientScopesForUser({ ...consentedScopesForUser, userId: user.id });
  }
}
