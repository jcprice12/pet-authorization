import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';
import { AsyncLocalStorageService, AsyncLocalStorageValue } from './async-local-storage.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly asyncLocalStorageService: AsyncLocalStorageService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const correlationId = req.get('correlation-id') || v4();
    this.asyncLocalStorageService.setAsyncLocalStorageValue(AsyncLocalStorageValue.CORRELATION_ID, correlationId);
    next();
  }
}
