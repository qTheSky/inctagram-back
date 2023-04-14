import { FindOptionsWhere, Repository } from 'typeorm';

export abstract class AbstractRepository<T> {
  protected constructor(private readonly repo: Repository<T>) {}

  async findOne(where: FindOptionsWhere<T>) {
    return await this.repo.findOne({ where });
  }

  async save(model: T): Promise<T> {
    return await this.repo.save(model);
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async softDelete(id: string): Promise<boolean> {
    await this.repo.softDelete(id);
    return true;
  }
}
