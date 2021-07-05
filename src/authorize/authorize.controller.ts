import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common';
import { RequiredPipe } from '../common/required.pipe';
import { ValidEnumPipe } from '../common/valid-enum.pipe';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  @Get()
  authorize(
    @Query('response_type', new ValidEnumPipe(ResponseType)) responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri', RequiredPipe) redirectUri: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scope: Array<string>
  ): any {
    return {
      responseType,
      clientId,
      redirectUri,
      scope
    };
  }
}
