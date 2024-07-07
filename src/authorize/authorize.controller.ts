import {
  Controller,
  Get,
  Inject,
  ParseArrayPipe,
  Query,
  Redirect,
  Req,
  UseFilters,
  UseInterceptors
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PublicUser } from '../users/user.model';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { FullURL } from '../util/url.decorator';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { AuthorizationRequestExceptionFilter } from './authorization-request-exception.filter';
import { AuthorizeService } from './authorize.service';
import { ClientInterceptor } from './client.interceptor';
import { CodeChallengeMethod } from './code-challenge-method.enum';
import { LoginRequiredError } from './login-required.error';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';
import { RedirectUriPipe } from './redirect-uri.pipe';
import { RedirectService } from './redirect.service';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  constructor(
    private readonly authorizeService: AuthorizeService,
    private readonly redirectService: RedirectService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get()
  @UseFilters(AuthorizationRequestExceptionFilter)
  @UseInterceptors(ClientInterceptor) // interceptor errors are caught by filter (as opposed to middleware errors)
  @Redirect()
  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [() => ({ name: 'req', value: LogAttributeValue.IGNORED })]
  })
  async handleAuthorizeRequest(
    @Req() req: Request,
    @FullURL() fullUrl: URL,
    @Query('client_id') clientId: string, // no pipe needed because interceptor checks for validity
    @Query('redirect_uri', RedirectUriPipe) redirectUri: string, // param pipes are all run at once, so interceptor needed to set client on request
    @Query('response_type', new ValidEnumPipe(ResponseType)) _responseType: ResponseType,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scopes: Array<string>,
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
        const cb = new URL(redirectUri);
        const authCode = await this.authorizeService.attemptToCreateAuthCode(
          clientId,
          user.id,
          scopes,
          redirectUri,
          codeChallengeMethod,
          codeChallenge
        );
        redirectObject = this.redirectService.goToCbUrlWithAuthCode(cb, authCode.code, state);
      }
    } else {
      throw new LoginRequiredError();
    }
    return redirectObject;
  }
}
