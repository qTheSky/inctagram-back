import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage() as any;

/**
 * it needs for transactions
 */
@Injectable()
export class EntityManagerContext {
  get manager(): EntityManager | null {
    return asyncLocalStorage.getStore()?.manager || null;
  }

  set manager(manager: EntityManager | null) {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.manager = manager;
    }
  }
}
/**
 * it needs for transactions
 */
// @Injectable()
// export class EntityManagerContext {
//   manager: EntityManager | null;
// }
