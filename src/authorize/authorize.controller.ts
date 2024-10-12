import { Controller, Get, Inject, Query, Redirect, Req, UseFilters, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ClientsService } from '../clients/clients.service';
import { Scope } from '../server-metadata/scope.enum';
import { PublicUser } from '../users/user.model';
import { everyValueUnique } from '../util/every-value-unique.validation';
import { LogAttributeValue } from '../util/log-attribute-value.enum';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { Span } from '../util/span.decorator';
import { retreiveAppTracer } from '../util/span.retriever';
import { FullURL } from '../util/url.decorator';
import { ValidArrayOfEnumPipe } from '../util/valid-array-of-enum.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { AuthorizationRequestExceptionFilter } from './authorization-request-exception.filter';
import { AuthorizeService } from './authorize.service';
import { CodeChallengeMethod } from './code-challenge-method.enum';
import { LoginRequiredError } from './login-required.error';
import { nonePromptMustBeAlone } from './none-prompt-must-be-alone.validation';
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
    @Query('response_type', new ValidEnumPipe(ResponseType)) _responseType: ResponseType,
    @Query('client_id') clientId: string, // no pipe needed because interceptor checks for validity
    @Query('redirect_uri') redirectUri?: string, // no pipe needed because interceptor checks for validity
    @Query('state') state?: string,
    @Query(
      'scope',
      new ValidArrayOfEnumPipe(Scope, { separator: ' ', optional: true, additionalValidations: [everyValueUnique] })
    )
    scopes?: Array<Scope>,
    @Query(
      'prompt',
      new ValidArrayOfEnumPipe(Prompt, {
        separator: ' ',
        optional: true,
        additionalValidations: [everyValueUnique, nonePromptMustBeAlone]
      })
    )
    prompts: Array<string> = [Prompt.NONE],
    @Query('code_challenge') codeChallenge?: string,
    @Query('code_challenge_method', new ValidEnumPipe(CodeChallengeMethod, { optional: true }))
    codeChallengeMethod: CodeChallengeMethod = CodeChallengeMethod.PLAIN
  ): Promise<RedirectObject> {
    let redirectObject: RedirectObject;
    if (prompts.some((prompt) => prompt === Prompt.LOGIN)) {
      redirectObject = this.redirectService.goToLoginPage(fullUrl);
    } else if (req.isAuthenticated()) {
      if (prompts.some((prompt) => prompt === Prompt.CONSENT)) {
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
