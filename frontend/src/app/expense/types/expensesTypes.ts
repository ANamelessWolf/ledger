import { CatalogItem } from '@common/types/catalogTypes';
import { Pagination, SortType } from '@config/commonTypes';

export type DateRange = {
  start: Date;
  end: Date;
};

export type ExpenseRange = {
  min: number;
  max: number;
};

export type ExpenseFilter = {
  wallet?: number[];
  expenseTypes?: number[];
  vendors?: number[];
  period?: DateRange;
  expenseRange?: ExpenseRange;
  description?: string;
};

export const EMPTY_EXPENSE_FILTER = {
  wallet: undefined,
  expenseTypes: undefined,
  vendors: undefined,
  period: undefined,
  expenseRange: undefined,
  description: undefined,
};

export type ExpenseSearchOptions = {
  pagination: Pagination;
  sorting?: SortType;
  filter: ExpenseFilter;
};

export type AddExpense = {
  walletId: number;
  expenseTypeId: number;
  vendorId: number;
  total: number;
  expenseDate: string;
  description: string;
};

export const EMPTY_NEW_EXPENSE = {
  walletId: 0,
  expenseTypeId: 0,
  vendorId: 0,
  total: 0,
  expenseDate: new Date(),
  description: '',
};

export type ExpenseOptions = {
  wallets: CatalogItem[];
  expenseTypes: CatalogItem[];
  vendors: CatalogItem[];
};

export const EMPTY_EXPENSES: ExpenseOptions = {
  wallets: [],
  expenseTypes: [],
  vendors: [],
};
