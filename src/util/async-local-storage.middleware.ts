import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { asyncLocalStorage } from '../async-local-storage';
import { AsyncLocalStorageValue } from './async-local-storage.service';

@Injectable()
export class AsyncLocalStorageMiddleware implements NestMiddleware {
  constructor() {}

  //https://blog.haroldadmin.com/posts/asynclocalstorage-logs-nestjs
  use(_req: Request, _res: Response, next: NextFunction) {
    asyncLocalStorage.run(new Map<AsyncLocalStorageValue, any>(), next);
  }
}
