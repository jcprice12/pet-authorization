import { ArgumentMetadata, Inject, Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Client } from '../clients/client.model';
import { InvalidRedirectUriError } from './invalid-redirect-uri.error';

@Injectable()
export class RedirectUriPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly req: Request & { oAuthClient: Client }) {}

  transform(redirect_uri: string | undefined, _metadata: ArgumentMetadata): string {
    console.log(redirect_uri);
    console.log(this.req.oAuthClient.redirect_uris);
    if (redirect_uri && this.req.oAuthClient.redirect_uris.includes(redirect_uri)) {
      return redirect_uri;
    } else if (!redirect_uri) {
      const defaultRedirectUri = this.req.oAuthClient.redirect_uris[0];
      this.req.query.redirect_uri = defaultRedirectUri;
      return defaultRedirectUri;
    }
    throw new InvalidRedirectUriError();
  }
}
