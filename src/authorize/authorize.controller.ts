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
import { ClientsService } from '../clients/clients.service';
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
import { CodeChallengeMethod } from './code-challenge-method.enum';
import { LoginRequiredError } from './login-required.error';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';
import { RedirectValidationInterceptor } from './redirect-validation.interceptor';
import { RedirectService } from './redirect.service';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  constructor(
    private readonly authorizeService: AuthorizeService,
    private readonly redirectService: RedirectService,
    private readonly clientService: ClientsService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Get()
  @UseFilters(AuthorizationRequestExceptionFilter)
  @UseInterceptors(RedirectValidationInterceptor) // client_id and redirect_uri validation occurs here because they must be validated first
  @Redirect()
  @Span(retreiveAppTracer)
  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [() => ({ name: 'req', value: LogAttributeValue.IGNORED })]
  })
  async handleAuthorizeRequest(
    @Req() req: Request,
    @FullURL() fullUrl: URL,
    @Query('client_id') clientId: string, // no pipe needed because interceptor checks for validity
    @Query('response_type', new ValidEnumPipe(ResponseType)) _responseType: ResponseType,
    @Query('redirect_uri') redirectUri?: string, // no pipe needed because interceptor checks for validity
    @Query('scope', new ParseArrayPipe({ separator: ' ', optional: true })) scopes?: Array<string>,
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
        const authCode = await this.authorizeService.attemptToCreateAuthCode(
          clientId,
          user.id,
          codeChallengeMethod,
          redirectUri,
          scopes,
          codeChallenge
        );
        const cb = new URL(redirectUri || (await this.clientService.getClient(clientId)).redirect_uris[0]);
        redirectObject = this.redirectService.goToCbUrlWithAuthCode(cb, authCode.code, state);
      }
    } else {
      throw new LoginRequiredError();
    }
    return redirectObject;
  }
}
