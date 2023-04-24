import { FindOptionsWhere, Repository } from 'typeorm';
import { EntityManagerContext } from '../interceptors/transactions/entityManager.context';

export abstract class AbstractRepository<ENTITY> {
  protected constructor(
    private readonly repository: Repository<ENTITY>,
    private readonly entityManagerCtx: EntityManagerContext
  ) {}

  async save(entity: ENTITY): Promise<ENTITY> {
    return this.entityManagerCtx.manager
      ? this.entityManagerCtx.manager.save(entity)
      : this.repository.save(entity);
  }

  async findOne(where: FindOptionsWhere<ENTITY>) {
    return await this.repository.findOne({ where });
  }

  async delete(entity: ENTITY): Promise<void> {
    (await this.entityManagerCtx.manager?.remove(entity)) ||
      (await this.repository.remove(entity));
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
