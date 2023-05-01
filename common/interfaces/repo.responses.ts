import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

export interface PaginationParams<T> {
  page?: number;
  limit?: number;
  filterFields?: FindOptionsWhere<T>;
  sortFields?: FindOptionsOrder<T>;
}

export interface SaveResult {
  lastInsertedId: number;
}

export interface UpdateResult {
  affected: number;
}

export interface DeleteResult {
  affected: number;
}
