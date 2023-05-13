import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NewPaginationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const pagination = new NewPagination();
    Object.assign(pagination, value);
    return pagination;
  }
}

export class NewPagination {
  page = 1;
  limit = 10;
  filters: any = {};
  orFilters: any = {};
  order: { [key: string]: 'ASC' | 'DESC' } = { createdAt: 'DESC' };
}
