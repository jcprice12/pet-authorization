import { Controller, Get, ParseArrayPipe, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RequiredPipe } from '../common/required.pipe';
import { SessionService } from '../common/session.service';
import { ValidEnumPipe } from '../common/valid-enum.pipe';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  authorize(
    @Query('response_type', new ValidEnumPipe(ResponseType)) responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri', RequiredPipe) redirectUri: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ' })) scope: Array<string>,
    @Req() req: Request,
    @Res() res: Response
  ): any {
    console.log('authorize');
    console.log('cookies', req.cookies);
    const session = this.sessionService.getSession(req.cookies.PETSESH);
    console.log('session', session);
    if (session) {
      console.log('logged on');
      res.redirect(redirectUri);
    } else {
      console.log('not logged on');
      res.redirect('/login');
    }
  }
}
