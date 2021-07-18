import { Controller, Get, ParseArrayPipe, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { ParseOptionalBoolPipe } from '../util/optional-bool.pipe';
import { RequiredPipe } from '../util/required.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  @UseGuards(AuthenticatedGuard)
  @Get()
  authorize(
    @Res() res: Response,
    @Query('response_type', new ValidEnumPipe(ResponseType))
    responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ', optional: true }))
    scope?: Array<string>,
    @Query('state') state?: string,
    @Query('shouldShowLoginPrompt', ParseOptionalBoolPipe) shouldShowLoginPrompt?: boolean,
    @Query('shouldShowConsentPrompt', ParseOptionalBoolPipe) shouldShowConsentPrompt?: boolean
  ): any {
    return {};
  }
}
