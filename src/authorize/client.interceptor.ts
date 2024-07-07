import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { catchError, concatMap, from, iif, Observable, tap, throwError } from 'rxjs';
import { Client } from '../clients/client.model';
import { ClientsService } from '../clients/clients.service';
import { InvalidClientIdError } from './invalid-client-id.error';

@Injectable()
export class ClientInterceptor implements NestInterceptor {
  constructor(private readonly clientsService: ClientsService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const host = context.switchToHttp();
    const req = host.getRequest<Request & { oAuthClient: Client }>();
    const clientId = (req.query.client_id as string) || '';
    const client$ = from(this.clientsService.getClient(clientId)).pipe(
      catchError(() => throwError(() => new InvalidClientIdError())),
      tap((client) => {
        req.oAuthClient = client;
      }),
      concatMap(next.handle)
    );
    const error$ = throwError(() => new InvalidClientIdError());
    return iif(() => !!clientId, client$, error$);
  }
}
