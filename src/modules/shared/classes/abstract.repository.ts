import { Brackets, FindOptionsWhere, Repository } from 'typeorm';
import { EntityManagerContext } from '../interceptors/transactions/entityManager.context';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { NewPagination } from '../new-pagination/newPagination';

function createFilterConditions(
  qb: SelectQueryBuilder<any>,
  filters: any,
  orFilters: any,
  alias: string
) {
  for (const field in filters) {
    const filter = filters[field];
    switch (filter.op) {
      case 'eq':
        qb.andWhere(`${alias}.${field} = :value`, { value: filter.value });
        break;
      case 'lt':
        qb.andWhere(`${alias}.${field} < :value`, { value: filter.value });
        break;
      case 'gt':
        qb.andWhere(`${alias}.${field} > :value`, { value: filter.value });
        break;
      case 'between':
        qb.andWhere(`${alias}.${field} BETWEEN :start AND :end`, {
          start: filter.value,
          end: filter.endValue,
        });
        break;
      case 'like':
        qb.andWhere(`LOWER(${alias}.${field}) LIKE LOWER(:value)`, {
          value: `%${filter.value}%`,
        });
        break;
    }
  }

  if (orFilters && orFilters.length > 0) {
    const orBrackets = new Brackets((qb2) => {
      orFilters.forEach((orFilter, index) => {
        for (const field in orFilter) {
          const filter = orFilter[field];
          switch (filter.op) {
            case 'eq':
              qb2.orWhere(`${alias}.${field} = :value${index}`, {
                ['value' + index]: filter.value,
              });
              break;
            case 'like':
              qb2.orWhere(
                `LOWER(${alias}.${field}) LIKE LOWER(:value${index})`,
                { ['value' + index]: `%${filter.value}%` }
              );
              break;
          }
        }
      });
    });
    qb.andWhere(orBrackets);
  }

  return qb;
}

export abstract class AbstractRepository<ENTITY> {
  protected constructor(
    private readonly repository: Repository<ENTITY>,
    private readonly entityManagerCtx: EntityManagerContext
  ) {}

  async findManyAndCount(query: NewPagination) {
    const { page, limit, filters, orFilters, order } = query;

    const take = limit || 10;
    const skip = (page - 1) * limit || 0;

    let builder = this.repository.createQueryBuilder('entity');

    builder = createFilterConditions(builder, filters, orFilters, 'entity');

    for (const key in order) {
      builder = builder.addOrderBy(`${'entity'}.${key}`, order[key]);
    }

    builder.take(take);
    builder.skip(skip);

    const [items, totalCount] = await builder.getManyAndCount();

    return { items, totalCount };
  }

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
