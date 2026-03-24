import { AsyncLocalStorage } from 'async_hooks';

export interface UserContext {
  userId: string;
  tenantId: string;
}

export const userContextStorage = new AsyncLocalStorage<UserContext>();
