import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ClientsService } from '../clients/clients.service';
import { ConsentRequiredError } from './consent-required.error';
import { ErrorCode } from './error-code.enum';
import { InvalidClientIdError } from './invalid-client-id.error';
import { InvalidRedirectUriError } from './invalid-redirect-uri.error';
import { LoginRequiredError } from './login-required.error';
import { RedirectService } from './redirect.service';

@Catch()
export class AuthorizationRequestExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clientsService: ClientsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async catch(error: Error, host: ArgumentsHost) {
    this.logger.error(error);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (error instanceof InvalidClientIdError || error instanceof InvalidRedirectUriError) {
      response.send({ status: HttpStatus.BAD_REQUEST, message: error.message }).status(HttpStatus.BAD_REQUEST); // OAuth spec does not specify what the response should be, only that it shouldn't redirect
    } else {
      const request = ctx.getRequest<Request>();
      const state = request.query.state as string | undefined;
      const cb =
        (request.query.redirect_uri as string | undefined) ||
        (await this.clientsService.getClient(request.query.client_id as string)).redirect_uris[0];
      if (error instanceof BadRequestException) {
        response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.INVALID_REQUEST, state).url);
      } else if (error instanceof LoginRequiredError) {
        response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.LOGIN_REQUIRED, state).url);
      } else if (error instanceof ConsentRequiredError) {
        response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.ACCESS_DENIED, state).url);
      } else {
        response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.SERVER_ERROR, state).url);
      }
    }
  }
}
