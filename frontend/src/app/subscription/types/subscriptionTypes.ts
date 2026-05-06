import { CatalogItem } from '@common/types/catalogTypes';
import { AddExpense, ExpenseOptions } from '@expense/types/expensesTypes';

export type Subscription = {
  id: number;
  name: string;
  price: number;
  active: number;
  chargeDay: number;
  lastPaymentDate: string;
  walletId: number;
  wallet: string;
  walletGroupId: number;
  walletGroup: string;
  currencyId: number;
  currency: string;
  currencySymbol: string;
  paymentFrequencyId: number;
  paymentFrequency: string;
};

export type AddSubscription = {
  walletGroupId: number;
  currencyId: number;
  paymentFrequencyId: number;
  name: string;
  price: number;
  active: number;
  chargeDay: number;
  lastPaymentDate: string;
};

export type UpdateSubscription = AddSubscription & { id: number };

export type PaymentHistoryItem = {
  id: number;
  subscriptionId: number;
  expenseId: number;
  description: string;
  total: number;
  buyDate: string;
  wallet: string;
  walletId: number;
  expenseType: string;
};

export type ExpenseSearchResult = {
  id: number;
  description: string;
  total: number;
  buyDate: string;
  wallet: string;
  walletId: number;
};

export type SubscriptionSummary = {
  monthlyTotal: number;
  annualTotal: number;
  month: number;
  year: number;
};

export type SubscriptionFormData = {
  subscription?: UpdateSubscription;
  walletGroups: CatalogItem[];
  currencies: CatalogItem[];
  paymentFrequencies: CatalogItem[];
  onSaved: (data: AddSubscription) => void;
};

export type SubscriptionFilter = {
  status: 'active' | 'inactive' | 'all';
  paymentFrequencyId: number | null;
  walletGroupId: number | null;
};

export const DEFAULT_SUBSCRIPTION_FILTER: SubscriptionFilter = {
  status: 'all',
  paymentFrequencyId: null,
  walletGroupId: null,
};

export type SubscriptionFilterDialogData = {
  current: SubscriptionFilter;
  paymentFrequencies: CatalogItem[];
  walletGroups: CatalogItem[];
};

export type PriceHistoryItem = {
  total: number;
  buyDate: string;
};

export type PriceHistoryDialogData = {
  subscriptionId: number;
  subscriptionName: string;
  currencyConversion: number;
  onLoadPriceHistory: (callback: (items: PriceHistoryItem[]) => void) => void;
};

export type ExistingPaymentRef = {
  id: number;
  expenseId: number;
};

export type AddPaymentDialogData = {
  subscriptionId: number;
  subscriptionName: string;
  expenseOptions: ExpenseOptions;
  existingPayments: ExistingPaymentRef[];
  onSearchExpenses: (description: string, callback: (results: ExpenseSearchResult[]) => void) => void;
  onPaymentsAdded: (expenseIds: number[]) => void;
  onPaymentUnlinked: (paymentHistoryId: number) => void;
  onExpenseCreated: (expense: AddExpense, onCreated: (expenseId: number) => void) => void;
};

export type PaymentHistoryDialogData = {
  subscriptionId: number;
  subscriptionName: string;
  onLoadHistory: (callback: (items: PaymentHistoryItem[]) => void) => void;
  onPaymentRemoved: (paymentId: number) => void;
};

export const EMPTY_ADD_SUBSCRIPTION: AddSubscription = {
  walletGroupId: 0,
  currencyId: 0,
  paymentFrequencyId: 0,
  name: '',
  price: 0,
  active: 1,
  chargeDay: 1,
  lastPaymentDate: '',
};
