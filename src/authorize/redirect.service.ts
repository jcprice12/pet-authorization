import { Injectable } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';

@Injectable()
export class RedirectService {
  goToCbUrlWithError(url: URL, errorCode: ErrorCode): RedirectObject {
    return this.goToUrlWithParams(url, new Map([['error', errorCode]]));
  }

  goToCbUrlWithAuthCode(url: URL, authCode: string, state?: string): RedirectObject {
    const params = new Map([['code', authCode]]);
    if (state) {
      params.set('state', state);
    }
    return this.goToUrlWithParams(url, params);
  }

  goToLoginPage(uriToGoToAfterLogin: URL): RedirectObject {
    uriToGoToAfterLogin.searchParams.set('prompt', Prompt.NONE);
    return this.goToUrl(`/users/login?redirect_uri=${encodeURIComponent(uriToGoToAfterLogin.toString())}`);
  }

  goToConsentPage(uriToGoToAfterConsent: URL): RedirectObject {
    const clientId = uriToGoToAfterConsent.searchParams.get('client_id');
    const desiredScope = uriToGoToAfterConsent.searchParams.get('scope');
    uriToGoToAfterConsent.searchParams.set('prompt', Prompt.NONE);
    return this.goToUrl(
      `/users/consent?scope=${encodeURIComponent(desiredScope)}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        uriToGoToAfterConsent.toString()
      )}`
    );
  }

  private goToUrl(url: URL | string): RedirectObject {
    return {
      url: url.toString()
    };
  }

  private goToUrlWithParams(url: URL, params: Map<string, string>): RedirectObject {
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    return this.goToUrl(url);
  }
}
