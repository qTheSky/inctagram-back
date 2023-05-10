import { Paginated } from "../../modules/shared/pagination/paginator";

export const getPaginatorExample = <VM>(subject: VM): Paginated<VM[]> => ({
  pagesCount: 0,
  page: 0,
  pageSize: 0,
  totalCount: 0,
  items: [subject],
});
