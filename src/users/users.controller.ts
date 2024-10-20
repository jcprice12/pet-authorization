import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Render,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { ScopeMetadataService } from '../server-metadata/scope-metadata.service';
import { Scope } from '../server-metadata/scope.enum';
import { everyValueUnique } from '../util/every-value-unique.validation';
import { Log } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { RequiredPipe } from '../util/required.pipe';
import { ValidArrayOfEnumPipe } from '../util/valid-array-of-enum.pipe';
import { ConsentDto } from './consent.model';
import { PublicUser, UserRegistrationDto } from './user.model';
import { UsersDao } from './users.dao';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersDao: UsersDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    private readonly scopeMetadataService: ScopeMetadataService
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
  async getUserConsentPage(
    @Req() req: Request,
    @Query('scope', new ValidArrayOfEnumPipe(Scope, { separator: ' ', additionalValidations: [everyValueUnique] }))
    scopes: Array<Scope>,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string
  ) {
    const user = req.user as PublicUser;
    const clientInfoForUser = await this.usersDao.findClientInfoForUser(user.id, clientId);
    const scopeMetadata = this.scopeMetadataService.getScopeMetadataFor(scopes);
    const desiredScopesMetadata = scopeMetadata.map((meta) => ({
      ...meta,
      consented: clientInfoForUser.scopes.includes(meta.name)
    }));
    return {
      afterConsentGoTo: redirectUri,
      desiredScopesMetadata,
      clientId
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('consent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async provideConsent(@Req() req: Request, @Body() consentedScopesForUser: ConsentDto) {
    const user = req.user as PublicUser;
    return this.usersDao.updateClientScopesForUser({ ...consentedScopesForUser, userId: user.id });
  }
}
