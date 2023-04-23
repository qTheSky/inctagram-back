import { FindOptionsWhere, Repository } from 'typeorm';

export abstract class AbstractRepository<ENTITY> {
  protected constructor(private readonly repository: Repository<ENTITY>) {}

  async save(entity: ENTITY): Promise<ENTITY> {
    return await this.repository.save(entity);
  }

  async findOne(where: FindOptionsWhere<ENTITY>) {
    return await this.repository.findOne({ where });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
