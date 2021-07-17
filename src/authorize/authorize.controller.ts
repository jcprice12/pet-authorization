import { Controller, Get, ParseArrayPipe, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../authentication/authenticated.guard';
import { RequiredPipe } from '../util/required.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  @UseGuards(AuthenticatedGuard)
  @Get()
  authorize(
    @Query('response_type', new ValidEnumPipe(ResponseType))
    responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ', optional: true })) scope?: Array<string>
  ): any {
    return {};
  }
}
