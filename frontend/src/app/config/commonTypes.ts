import { APP_SETTINGS } from './constants';

export type Pagination = {
  page: number;
  pageSize: number;
};

export interface PaginationEvent {
  pageIndex: number;
  pageSize: number;
}

export const EMPTY_PAGINATION: Pagination = {
  page: 1,
  pageSize: APP_SETTINGS.PAGINATION_SIZE,
};

export type SortType = {
  orderBy: string;
  orderDirection: 'ASC' | 'DSC';
};

export enum IconType {
  NORMAL = 1,
  BRAND = 2,
}
