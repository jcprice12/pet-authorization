import { Controller, Get, Query } from '@nestjs/common';
import { ValidEnumPipe } from '../common/valid-enum.pipe';
import { AuthorizeService } from './authorize.service';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  constructor(private readonly authorizeService: AuthorizeService) {}

  @Get()
  authorize(
    @Query('response_type', new ValidEnumPipe(ResponseType))
    responseType: ResponseType,
    @Query('client_id') clientId: string,
    @Query('redirect_url') redirectUrl: string,
    @Query('scope') scope: string
  ): Promise<string> {
    return this.authorizeService.authorize();
  }
}
