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
import { PublicUser } from '../user/user.model';
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
    _responseType: ResponseType,
    @Query('client_id', RequiredPipe) clientId: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('scope', new ParseArrayPipe({ separator: ' ', optional: true }))
    scope?: Array<string>,
    @Query('state') _state?: string,
    @Query('should_show_login_prompt', ParseOptionalBoolPipe) shouldShowLoginPrompt?: boolean,
    @Query('should_show_consent_prompt', ParseOptionalBoolPipe) shouldShowConsentPrompt?: boolean
  ): Promise<{ url: string }> {
    let redirectObject: { url: string };
    if (req.isAuthenticated()) {
      const user = req.user as PublicUser;
      if (shouldShowConsentPrompt) {
        redirectObject = this.goToConsentPage(req.url);
      } else {
        redirectObject = this.goToRedirectUri(
          redirectUri,
          await this.userService.getUsersMatchingConsentedScopesForClient(user.id, clientId, scope)
        );
      }
    } else if (shouldShowLoginPrompt) {
      redirectObject = this.goToLoginPage(req.url);
    } else {
      throw new ForbiddenException();
    }
    return redirectObject;
  }

  private goToLoginPage(uriToGoToAfterLogin: string) {
    return {
      url: `/user/login?redirect_uri${uriToGoToAfterLogin}`
    };
  }

  private goToConsentPage(uriToGoToAfterConsent: string) {
    const url = new URL(uriToGoToAfterConsent);
    url.searchParams.set('should_show_consent_prompt', 'false');
    return {
      url: `/user/consent?redirect_uri=${url.toString()}`
    };
  }

  private goToRedirectUri(redirectUri: string, matchingScopes: Array<string>) {
    const url = new URL(redirectUri);
    if (!matchingScopes.length) {
      url.searchParams.set('error', 'access_denied');
    }
    return {
      url: url.toString()
    };
  }
}
