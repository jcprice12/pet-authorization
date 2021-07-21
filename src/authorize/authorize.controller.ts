import {
  Controller,
  ForbiddenException,
  Get,
  ParseArrayPipe,
  Query,
  Redirect,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { ParseOptionalBoolPipe } from '../util/optional-bool.pipe';
import { RequiredPipe } from '../util/required.pipe';
import { ValidEnumPipe } from '../util/valid-enum.pipe';
import { ResponseType } from './response-type.enum';

@Controller('/authorize')
export class AuthorizeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Redirect()
  async authorize(
    @Req() req: Request,
    @Query('response_type', new ValidEnumPipe(ResponseType))
    responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ', optional: true }))
    scope?: Array<string>,
    @Query('state') state?: string,
    @Query('should_show_login_prompt', ParseOptionalBoolPipe) shouldShowLoginPrompt?: boolean,
    @Query('should_show_consent_prompt', ParseOptionalBoolPipe) shouldShowConsentPrompt?: boolean
  ): Promise<{ url: string }> {
    let redirectObject: { url: string } = { url: '/user/login' };
    if (req.isAuthenticated()) {
      if (shouldShowConsentPrompt) {
        const url = new URL(req.url);
        url.searchParams.set('should_show_consent_prompt', 'false');
        redirectObject = this.makeRedirectObject(`/user/consent?redirect_uri=${url.toString()}`);
      } else {
        redirectObject = this.makeRedirectObject(redirectUri);
      }
    } else if (shouldShowLoginPrompt) {
      redirectObject = this.makeRedirectObject(`/user/login?redirect_uri${req.url}`);
    } else {
      throw new ForbiddenException();
    }
    return redirectObject;
  }

  private makeRedirectObject(url: string): { url: string } {
    return {
      url
    };
  }
}
