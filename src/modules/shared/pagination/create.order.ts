import { PaginatorInputModel } from './paginator.model';

type DIRECTION = 'ASC' | 'DESC';
type ORDER = { [index: string]: DIRECTION };

const isString = (val: string | Array<string>): val is string => {
  return typeof val === 'string';
};

const sortTransform = (sort: string): ORDER => {
  const [field, _direction] = sort.split(' ');
  const direction = _direction.toUpperCase() as DIRECTION;
  return { [`${field}`]: direction };
};

const createSort = (order: ORDER, sort: string): ORDER => {
  const value = sortTransform(sort);
  return {
    ...order,
    ...value,
  };
};

export const orderSort = (sorts?: string | Array<string>): ORDER => {
  let order = {};
  if (sorts && Array.isArray(sorts)) {
    for (const sort of sorts) {
      order = createSort(order, sort);
    }
  }
  if (sorts && isString(sorts)) {
    order = createSort(order, sorts);
  }
  return order;
};
