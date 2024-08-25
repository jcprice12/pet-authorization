import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { catchError, from, iif, mergeMap, Observable, throwError } from 'rxjs';
import { Client } from '../clients/client.model';
import { ClientsService } from '../clients/clients.service';
import { InvalidClientIdError } from './invalid-client-id.error';
import { InvalidRedirectUriError } from './invalid-redirect-uri.error';

@Injectable()
export class RedirectValidationInterceptor implements NestInterceptor {
  constructor(private readonly clientsService: ClientsService) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const host = context.switchToHttp();
    const req = host.getRequest<Request & { oAuthClient: Client }>();
    const clientId = (req.query.client_id as string) || '';
    const redirect_uri = (req.query.redirect_uri as string) || '';
    const invalidClientIdError$ = throwError(() => new InvalidClientIdError());
    return iif(
      () => !!clientId,
      from(this.clientsService.getClient(clientId)).pipe(
        catchError(() => invalidClientIdError$),
        mergeMap((client: Client) =>
          iif(
            () => !!redirect_uri && !client.redirect_uris.includes(redirect_uri),
            throwError(() => new InvalidRedirectUriError()),
            next.handle()
          )
        )
      ),
      invalidClientIdError$
    );
  }
}
