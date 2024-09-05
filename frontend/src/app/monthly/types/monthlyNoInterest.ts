import { Pagination, SortType } from '@config/commonTypes';

export interface IFreeMontlyInt {
  current: number;
  monthly: number;
  total: number;
}

export const EMPTY_FREE_MONTHLY_INT = {
  current: 0,
  monthly: 0,
  total: 0,
};

export interface ICardValue {
  card: string;
  color: string;
  value: number;
}

export const EMPTY_MONTHLY_INT_FILTER: MoNoIntFilter = {
  creditCard: [],
  archived: 1,
  description: '',
};

export type MoNoIntFilter = {
  creditCard?: number[];
  archived?: number;
  description?: string;
};

export type MoNoIntSearchOptions = {
  pagination: Pagination;
  sorting?: SortType;
  filter: MoNoIntFilter;
};

export type Purchase = {
  id: number;
  creditCardId: number;
  card: string;
  description: string;
  walletGroupId: number;
  vendor: string;
  vendorId: number;
  total: string;
  value: number;
};

export type Payment = {
  id: number;
  purchaseId: number;
  expenseId: number;
  expenseTypeId: number;
  expenseType: string;
  expenseIcon: string;
  description: string;
  total: string;
  value: number;
  payDate: string;
  expenseDate: Date;
  isPaid: boolean;
};

export type NoIntMonthlyInstallment = {
  id: number;
  isArchived: boolean;
  months: number;
  paidMonths: number;
  date: Date;
  buyDate: String;
  purchase: Purchase;
  payments: Payment[];
};
