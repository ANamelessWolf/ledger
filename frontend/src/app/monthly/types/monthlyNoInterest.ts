import { CatalogItem } from '@common/types/catalogTypes';
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

const _now = new Date();
export const DEFAULT_MO_NO_INT_FILTER: MoNoIntFilter = {
  status: 'active',
  fromMonth: 1,
  fromYear: _now.getFullYear(),
  toMonth: 12,
  toYear: _now.getFullYear(),
  walletGroupId: null,
};

export const EMPTY_MONTHLY_INT_FILTER: MoNoIntFilter = { ...DEFAULT_MO_NO_INT_FILTER };

export const EMPTY_CREDIT_CARD_INST_TOT: CreditCardInstallmentTotal = {
  currentPeriod: {
    label: '',
    value: 0,
  },
  cards: [],
  totals: {
    monthlyBalance: 0,
    balance: 0,
    total: 0,
  },
  summary: {
    labels: [],
    balance: [],
    payment: [],
  },
};

export type MoNoIntFilter = {
  creditCard?: number[];
  status: 'active' | 'inactive' | 'all';
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
  walletGroupId: number | null;
};

export type MoNoIntFilterDialogData = {
  current: MoNoIntFilter;
  walletGroups: CatalogItem[];
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

export type CardBalance = {
  id: number;
  card: string;
  color: string;
  value: number;
  percent: number;
};

export type InstallmentTotal = {
  monthlyBalance: number;
  balance: number;
  total: number;
};

export type CreditCardInstallmentTotal = {
  currentPeriod: {
    label: string;
    value: number;
  };
  cards: CardBalance[];
  totals: InstallmentTotal;
  summary: {
    labels: string[];
    balance: number[];
    payment: number[];
  };
};

export type InstallmentPayment = {
  id: number;
  paymentId: number;
  creditCardId: number;
  wallet: string;
  expenseId: number;
  expense: string;
  expenseTypeId: number;
  expenseType: string;
  icon: string;
  vendorId: number;
  vendor: string;
  currencyId: number;
  currency: string;
  total: string;
  value: number;
  buyDate: string;
  archived: boolean;
  isPaid: boolean;
};
