import { DeepPartial } from 'typeorm';

export interface IAbstractRepository<T> {
  save(model: DeepPartial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
}
