import { Injectable } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';

@Injectable()
export class RedirectService {
  goToCbUrlWithError(url: URL, errorCode: ErrorCode, state?: string): RedirectObject {
    return this.goToCbUrlWithParams(url, [
      { name: 'error', value: errorCode },
      { name: 'state', value: state }
    ]);
  }

  goToCbUrlWithAuthCode(url: URL, authCode: string, state?: string): RedirectObject {
    return this.goToCbUrlWithParams(url, [
      { name: 'code', value: authCode },
      { name: 'state', value: state }
    ]);
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

  private goToCbUrlWithParams(url: URL, params: Array<{ name: string; value?: string }>): RedirectObject {
    params.forEach((param) => {
      if (param) {
        url.searchParams.set(param.name, param.value);
      }
    });
    return this.goToUrl(url);
  }

  private goToUrl(url: URL | string): RedirectObject {
    return {
      url: url.toString()
    };
  }
}
