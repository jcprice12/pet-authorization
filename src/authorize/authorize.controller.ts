import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  ParseArrayPipe,
  Query,
  Redirect,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PublicUser } from '../user/user.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { ParseOptionalBoolPipe } from '../util/optional-bool.pipe';
import { RequiredPipe } from '../util/required.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { AuthorizeService } from './authorize.service';
import { ResponseType } from './response-type.enum';
import { UserDeniedRequestError } from './user-denied-request.error';

@Controller('/authorize')
export class AuthorizeController {
  constructor(
    private readonly authorizeService: AuthorizeService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get()
  @Redirect()
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(req: Request) => ({ name: 'headers', value: req.headers })]
  })
  async authorize(
    @Req() req: Request,
    @Query('response_type', new ValidEnumPipe(ResponseType)) _responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scope: Array<string>,
    @Query('redirect_uri') redirectUri?: string,
    @Query('state') _state?: string,
    @Query('should_show_login_prompt', ParseOptionalBoolPipe) shouldShowLoginPrompt?: boolean,
    @Query('should_show_consent_prompt', ParseOptionalBoolPipe) shouldShowConsentPrompt?: boolean
  ): Promise<{ url: string }> {
    let redirectObject: { url: string };
    if (req.isAuthenticated()) {
      const user = req.user as PublicUser;
      if (shouldShowConsentPrompt) {
        redirectObject = this.goToConsentPage(req.url);
      } else {
        redirectObject = await this.goToRedirectUri(redirectUri, clientId, user.id, scope);
      }
    } else if (shouldShowLoginPrompt) {
      redirectObject = this.goToLoginPage(req.url);
    } else {
      throw new ForbiddenException();
    }
    return redirectObject;
  }

  private goToLoginPage(uriToGoToAfterLogin: string) {
    return {
      url: `/user/login?redirect_uri=${encodeURIComponent(uriToGoToAfterLogin)}`
    };
  }

  private goToConsentPage(uriToGoToAfterConsent: string) {
    const url = new URL(uriToGoToAfterConsent);
    const clientId = url.searchParams.get('client_id');
    const desiredScope = url.searchParams.get('scope');
    url.searchParams.set('should_show_consent_prompt', 'false');
    return {
      url: `/user/consent?scope=${desiredScope}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        url.toString()
      )}`
    };
  }

  private async goToRedirectUri(
    originalredirectUri: string,
    clientId: string,
    userId: string,
    scope: Array<string>
  ): Promise<{ url: string }> {
    const newRedirectUri = new URL(originalredirectUri);
    try {
      const authCode = await this.authorizeService.createAuthCode(clientId, userId, scope);
      newRedirectUri.searchParams.set('code', authCode.code);
    } catch (e) {
      if (e instanceof UserDeniedRequestError) {
        newRedirectUri.searchParams.set('error', 'access_denied');
      } else {
        newRedirectUri.searchParams.set('error', 'server_error');
      }
    }
    return {
      url: newRedirectUri.toString()
    };
  }
}
