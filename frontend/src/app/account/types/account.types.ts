export interface FinancingAccountItem {
  id: number;
  financingTypeId: number;
  typeName: string;
  accountType: AccountType | null;
  name: string;
  description: string;
}

export interface FinancingSection {
  id: number;
  financingAccountId: number;
  currencyId: number;
  displayCurrencyId: number | null;
  name: string;
  balance: number;
  isInvestment: number;
  isLocked: number;
  isAvailable: number;
  isComplete: number;
  investmentRate: number | null;
  investmentStartDate: string | null;
  investmentEndDate: string | null;
  currencySymbol: string;
  currencyName: string;
  balanceInDefault: number;
  displayCurrencySymbol: string | null;
  displayCurrencyName: string | null;
  balanceInDisplay: number | null;
}

export interface SavingDetail {
  id: number;
  preferredWalletId: number;
  walletGroupId: number | null;
  entityId: number;
  financingAccountId: number;
  currencyId: number;
  balance: number;
  walletName: string;
  entityName: string;
  currencySymbol: string;
  currencyName: string;
}

export interface InvestmentDetail {
  id: number;
  currencyId: number;
  financingAccountId: number;
  balance: string;
  currencySymbol: string;
  currencyName: string;
}

export interface FinancingAccountDetail {
  account: FinancingAccountItem;
  detail: SavingDetail | InvestmentDetail;
  sections: FinancingSection[];
  totalBalance: number;
  defaultCurrencySymbol: string;
}

export interface CreateSavingsPayload {
  preferredWalletId: number;
  walletGroupId: number | null;
  entityId: number;
  currencyId: number;
  balance: number;
}

export interface CreateInvestmentPayload {
  currencyId: number;
  balance: number;
}

export interface CreateAccountPayload {
  name: string;
  description: string;
  financingTypeId: number;
  savings?: CreateSavingsPayload;
  investment?: CreateInvestmentPayload;
}

export interface UpdateAccountPayload {
  name: string;
  description: string;
  mainBalance?: number;
}

export interface CreateSectionPayload {
  currencyId: number;
  displayCurrencyId?: number | null;
  name: string;
  balance: number;
  isInvestment: boolean;
  isLocked: boolean;
  isAvailable: boolean;
  investmentRate?: number | null;
  investmentStartDate?: string | null;
  investmentEndDate?: string | null;
}

export interface CurrencyItem {
  id: number;
  name: string;
  symbol: string;
  conversion: number;
}

export interface PreferredWallet {
  id: number;
  name: string;
  currencyId: number;
}

export interface MoveBalancePayload {
  amount: number;
  destinationType: 'account' | 'section' | 'new';
  targetSectionId?: number;
  newSection?: CreateSectionPayload;
}

export interface EndInvestmentPayload {
  earnings: number;
  destinationType: 'account' | 'section';
  targetSectionId?: number;
}

export type AccountType = 'savings' | 'investment';
export type SectionType = 'banking' | 'investment';
