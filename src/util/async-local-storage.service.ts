import { Injectable } from '@nestjs/common';
import { asyncLocalStorage } from '../async-local-storage';

export enum AsyncLocalStorageValue {
  CORRELATION_ID = 'CORRELATION_ID'
}

@Injectable()
export class AsyncLocalStorageService {
  getAsyncLocalStorageValue<T>(key: AsyncLocalStorageValue): T {
    const store = this.getStore();
    return store.get(key);
  }
  setAsyncLocalStorageValue<T>(key: AsyncLocalStorageValue, value: T): void {
    const store = this.getStore();
    store.set(key, value);
  }
  private getStore(): Map<AsyncLocalStorageValue, any> {
    const store = asyncLocalStorage.getStore() as Map<AsyncLocalStorageValue, any>;
    return store ?? new Map<AsyncLocalStorageValue, any>();
  }
}
