import { Controller, Get, Inject, ParseArrayPipe, Query, Redirect, Req } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PublicUser } from '../users/user.model';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { RequiredPipe } from '../util/required.pipe';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { FullURL } from '../util/url.decorator';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { AuthorizeService } from './authorize.service';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';
import { RedirectService } from './redirect.service';
import { ResponseType } from './response-type.enum';
import { UserDeniedRequestError } from './user-denied-request.error';

@Controller('/authorize')
export class AuthorizeController {
  constructor(
    private readonly authorizeService: AuthorizeService,
    private readonly redirectService: RedirectService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get()
  @Redirect()
  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [() => ({ name: 'req', value: LogAttributeValue.IGNORED })]
  })
  async handleAuthorizeRequest(
    @Req() req: Request,
    @FullURL() fullUrl: URL,
    @Query('response_type', new ValidEnumPipe(ResponseType)) _responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scopes: Array<string>,
    @Query('redirect_uri') redirectUri?: string,
    @Query('prompt', new ValidEnumPipe(Prompt, { isOptional: true })) prompt?: string
  ): Promise<RedirectObject> {
    let redirectObject: RedirectObject;
    if (prompt === Prompt.LOGIN) {
      redirectObject = this.redirectService.goToLoginPage(fullUrl);
    } else if (req.isAuthenticated()) {
      if (prompt === Prompt.CONSENT) {
        redirectObject = this.redirectService.goToConsentPage(fullUrl);
      } else {
        const user = req.user as PublicUser;
        redirectObject = await this.authorize(redirectUri, clientId, user.id, scopes);
      }
    } else {
      redirectObject = this.redirectService.goToCbUrlWithError(new URL(redirectUri), ErrorCode.LOGIN_REQUIRED);
    }
    return redirectObject;
  }

  private async authorize(
    originalredirectUri: string,
    clientId: string,
    userId: string,
    scopes: Array<string>
  ): Promise<RedirectObject> {
    const newRedirectUri = new URL(originalredirectUri);
    try {
      const authCode = await this.authorizeService.createAuthCode(clientId, userId, scopes, originalredirectUri);
      return this.redirectService.goToCbUrlWithAuthCode(newRedirectUri, authCode.code);
    } catch (e) {
      return e instanceof UserDeniedRequestError
        ? this.redirectService.goToCbUrlWithError(newRedirectUri, ErrorCode.ACCESS_DENIED)
        : this.redirectService.goToCbUrlWithError(newRedirectUri, ErrorCode.SERVER_ERROR);
    }
  }
}
