import { Controller, Get, Inject, ParseArrayPipe, Query, Redirect, Req } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PublicUser } from '../user/user.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { RequiredPipe } from '../util/required.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { AuthorizeService } from './authorize.service';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { ResponseType } from './response-type.enum';
import { UserDeniedRequestError } from './user-denied-request.error';

type RedirectObject = { url: string };

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
    @Query('prompt', new ValidEnumPipe(Prompt, { isOptional: true })) prompt?: string
  ): Promise<RedirectObject> {
    let redirectObject: RedirectObject;
    if (prompt === Prompt.LOGIN) {
      redirectObject = this.goToLoginPage(this.buildAbsoluteUrlForRequest(req));
    } else {
      if (req.isAuthenticated()) {
        const user = req.user as PublicUser;
        if (prompt === Prompt.CONSENT) {
          redirectObject = this.goToConsentPage(this.buildAbsoluteUrlForRequest(req));
        } else {
          redirectObject = await this.goToRedirectUri(redirectUri, clientId, user.id, scope);
        }
      } else {
        redirectObject = this.goToRedirectUriWithError(redirectUri, ErrorCode.LOGIN_REQUIRED);
      }
    }
    return redirectObject;
  }

  private buildAbsoluteUrlForRequest(request: Request): URL {
    return new URL(`${request.protocol}://${request.get('host')}${request.url}`);
  }

  private goToUrl(url: URL | string): RedirectObject {
    return {
      url: url.toString()
    };
  }

  private goToRedirectUriWithError(
    redirectUri: string | URL,
    errorCode: ErrorCode
  ): RedirectObject {
    if (typeof redirectUri === 'string') {
      redirectUri = new URL(redirectUri);
    }
    redirectUri.searchParams.set('error', errorCode);
    return this.goToUrl(redirectUri);
  }

  private goToLoginPage(uriToGoToAfterLogin: URL): RedirectObject {
    uriToGoToAfterLogin.searchParams.set('prompt', Prompt.NONE);
    return this.goToUrl(
      `/user/login?redirect_uri=${encodeURIComponent(uriToGoToAfterLogin.toString())}`
    );
  }

  private goToConsentPage(uriToGoToAfterConsent: URL): RedirectObject {
    const clientId = uriToGoToAfterConsent.searchParams.get('client_id');
    const desiredScope = uriToGoToAfterConsent.searchParams.get('scope');
    uriToGoToAfterConsent.searchParams.set('prompt', Prompt.NONE);
    return this.goToUrl(
      `/user/consent?scope=${desiredScope}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        uriToGoToAfterConsent.toString()
      )}`
    );
  }

  private async goToRedirectUri(
    originalredirectUri: string,
    clientId: string,
    userId: string,
    scope: Array<string>
  ): Promise<RedirectObject> {
    const newRedirectUri = new URL(originalredirectUri);
    try {
      const authCode = await this.authorizeService.createAuthCode(clientId, userId, scope);
      newRedirectUri.searchParams.set('code', authCode.code);
      return this.goToUrl(newRedirectUri);
    } catch (e) {
      return e instanceof UserDeniedRequestError
        ? this.goToRedirectUriWithError(newRedirectUri, ErrorCode.ACCESS_DENIED)
        : this.goToRedirectUriWithError(newRedirectUri, ErrorCode.SERVER_ERROR);
    }
  }
}
