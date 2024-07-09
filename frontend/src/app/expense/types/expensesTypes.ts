import { CatalogItem } from '@common/types/catalogTypes';
import { Pagination, SliderRange, SortType } from '@config/commonTypes';

export type DateRange = {
  start: Date;
  end: Date;
};

export type ExpenseFilter = {
  wallet?: number[];
  expenseTypes?: number[];
  vendors?: number[];
  period?: DateRange;
  expenseRange?: SliderRange;
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

export type ExpenseFilterOptions = {
  wallets: CatalogItem[];
  expenseTypes: CatalogItem[];
  vendors: CatalogItem[];
  visibility: {
    enableWallet: boolean;
    enableExpenseTypes: boolean;
    enableVendors: boolean;
  };
  filter: ExpenseFilter;
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
  buyDate: string;
  description: string;
};

export type UpdateExpense = AddExpense & {
  id: number;
};

export type ExpenseRequest = {
  id: number;
  body: UpdateExpense;
};

export const EMPTY_NEW_EXPENSE = {
  walletId: 0,
  expenseTypeId: 0,
  vendorId: 0,
  total: 0,
  buyDate: '',
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

export type Expense = {
  id: number;
  vendorId: number;
  vendor: string;
  walletId: number;
  wallet: string;
  expenseTypeId: number;
  expenseType: string;
  expenseIcon: string;
  description: string;
  buyDate: string;
  total: string;
  value: number;
};
