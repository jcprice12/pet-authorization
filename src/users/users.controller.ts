import { Body, Controller, Get, Inject, ParseArrayPipe, Post, Query, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { Log } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { RequiredPipe } from '../util/required.pipe';
import { UsersDao } from './users.dao';
import { PublicUser, UserRegistrationDto } from './user.model';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersDao: UsersDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get('/login')
  @Render('login-user')
  @Log(retrieveLoggerOnClass)
  getUserLoginPage(@Query('redirect_uri') redirectUri?: string) {
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
    return this.usersService.registerUser(user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('consent')
  @Render('user-consent')
  getUserConsentPage(
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scopes: Array<string>,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string
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
    return this.usersDao.updateClientScopesForUser({ ...consentedScopesForUser, userId: user.id });
  }
}
