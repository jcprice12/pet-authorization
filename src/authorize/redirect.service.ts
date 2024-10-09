import { Injectable } from '@nestjs/common';
import { ScopeMetadataService } from '../server-metadata/scope-metadata.service';
import { ErrorCode } from './error-code.enum';
import { Prompt } from './prompt.enum';
import { RedirectObject } from './redirect-object.model';

@Injectable()
export class RedirectService {
  constructor(private readonly scopeMetadataService: ScopeMetadataService) {}

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
    this.removePrompt(Prompt.LOGIN, uriToGoToAfterLogin);
    return this.goToUrl(`/users/login?redirect_uri=${encodeURIComponent(uriToGoToAfterLogin.toString())}`);
  }

  goToConsentPage(uriToGoToAfterConsent: URL): RedirectObject {
    const clientId = uriToGoToAfterConsent.searchParams.get('client_id');
    const desiredScope =
      uriToGoToAfterConsent.searchParams.get('scope') ?? this.scopeMetadataService.getAllSupportedScopesAsStr();
    this.removePrompt(Prompt.CONSENT, uriToGoToAfterConsent);
    return this.goToUrl(
      `/users/consent?scope=${encodeURIComponent(desiredScope)}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        uriToGoToAfterConsent.toString()
      )}`
    );
  }

  private removePrompt(promptToRemove: Prompt, urlWithPrompt: URL): void {
    let prompt = urlWithPrompt.searchParams.get('prompt');
    prompt = prompt.replace(promptToRemove, '').trim();
    if (prompt) {
      urlWithPrompt.searchParams.set('prompt', prompt);
    } else {
      urlWithPrompt.searchParams.delete('prompt');
    }
  }

  private goToCbUrlWithParams(url: URL, params: Array<{ name: string; value?: string }>): RedirectObject {
    params.forEach((param) => {
      if (param.value) {
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
