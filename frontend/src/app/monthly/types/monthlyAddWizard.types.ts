import { CatalogItem } from '@common/types/catalogTypes';

export type WizardCreditCard = {
  id: number;
  name: string;
  walletGroupId: number;
  color?: string;
};

export type WizardWallet = {
  id: number;
  name: string;
  currencyId: number;
  currency: string;
};

export type WizardExpenseSearchResult = {
  id: number;
  description: string;
  total: number;
  buyDate: string;
  wallet: string;
  walletId: number;
  currencyId: number;
  currency: string;
};

export type WizardPaymentRow = {
  index: number;
  description: string;
  buyDate: Date;
  total: number;
  walletId: number;
};

export type MonthlyPaymentPayload = {
  walletId: number;
  expenseTypeId: number;
  vendorId: number;
  total: number;
  buyDate: string;
  description: string;
};

export type MonthlyWizardPayload = {
  creditCardId: number;
  months: number;
  mainExpenseId?: number;
  mainExpense?: MonthlyPaymentPayload;
  payments: MonthlyPaymentPayload[];
};

export type MonthlyWizardDialogData = {
  creditCards: WizardCreditCard[];
  expenseTypes: CatalogItem[];
  vendors: CatalogItem[];
  onLoadWallets: (walletGroupId: number, callback: (wallets: WizardWallet[]) => void) => void;
  onSearchExpenses: (walletGroupId: number, description: string, callback: (results: WizardExpenseSearchResult[]) => void) => void;
  onConfirm: (payload: MonthlyWizardPayload) => void;
};
