import { Pagination, SortType } from "@config/commonTypes";

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
