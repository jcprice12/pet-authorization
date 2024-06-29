import { Controller, Get, Inject, ParseArrayPipe, Query, Redirect, Req, UseFilters } from '@nestjs/common';
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
import { CodeChallengeMethod } from './code-challenge-method.enum';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';
import { RedirectService } from './redirect.service';
import { ResponseType } from './response-type.enum';
import { UserDeniedRequestError } from './user-denied-request.error';
import { BadRequestExceptionFilter } from './bad-request-exception.filter';

@Controller('/authorize')
export class AuthorizeController {
  constructor(
    private readonly authorizeService: AuthorizeService,
    private readonly redirectService: RedirectService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get()
  @UseFilters(BadRequestExceptionFilter)
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
    @Query('prompt', new ValidEnumPipe(Prompt, { isOptional: true })) prompt?: string,
    @Query('state') state?: string,
    @Query('code_challenge') codeChallenge?: string,
    @Query('code_challenge_method', new ValidEnumPipe(Prompt, { isOptional: true }))
    codeChallengeMethod: CodeChallengeMethod = CodeChallengeMethod.PLAIN
  ): Promise<RedirectObject> {
    let redirectObject: RedirectObject;
    if (prompt === Prompt.LOGIN) {
      redirectObject = this.redirectService.goToLoginPage(fullUrl);
    } else if (req.isAuthenticated()) {
      if (prompt === Prompt.CONSENT) {
        redirectObject = this.redirectService.goToConsentPage(fullUrl);
      } else {
        const user = req.user as PublicUser;
        const newRedirectUri = new URL(redirectUri);
        try {
          const authCode = await this.authorizeService.attemptToCreateAuthCode(
            clientId,
            user.id,
            scopes,
            redirectUri,
            codeChallengeMethod,
            codeChallenge
          );
          redirectObject = this.redirectService.goToCbUrlWithAuthCode(newRedirectUri, authCode.code, state);
        } catch (e) {
          redirectObject =
            e instanceof UserDeniedRequestError
              ? this.redirectService.goToCbUrlWithError(newRedirectUri, ErrorCode.ACCESS_DENIED, state)
              : this.redirectService.goToCbUrlWithError(newRedirectUri, ErrorCode.SERVER_ERROR, state);
        }
      }
    } else {
      redirectObject = this.redirectService.goToCbUrlWithError(new URL(redirectUri), ErrorCode.LOGIN_REQUIRED);
    }
    return redirectObject;
  }
}
