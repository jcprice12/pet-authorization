import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from './error-code.enum';
import { LoginRequiredError } from './login-required.error';
import { RedirectService } from './redirect.service';
import { UserDeniedRequestError } from './user-denied-request.error';

@Catch()
export class AuthorizationRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly redirectService: RedirectService) {}

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const cb = request.query.redirect_uri as string;
    const state = request.query.state as string;
    if (error instanceof BadRequestException) {
      response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.INVALID_REQUEST, state).url);
    } else if (error instanceof LoginRequiredError) {
      response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.LOGIN_REQUIRED, state).url);
    } else if (error instanceof UserDeniedRequestError) {
      response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.ACCESS_DENIED, state).url);
    } else {
      response.redirect(this.redirectService.goToCbUrlWithError(new URL(cb), ErrorCode.SERVER_ERROR, state).url);
    }
  }
}
