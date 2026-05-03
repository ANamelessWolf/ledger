import { CatalogItem } from '@common/types/catalogTypes';

export type Budget = {
  id: number;
  ownerId: number;
  currencyId: number;
  description: string;
  icon: string;
  total: number;
};

export type BudgetItemDetail = {
  id: number;
  budgetId: number;
  itemType: number; // 1 = expense_type, 2 = vendor
  itemId: number;
};

export type AddBudget = {
  ownerId: number;
  currencyId: number;
  description: string;
  icon: string;
  total: number;
};

export type UpdateBudget = AddBudget & { id: number };

export type AddBudgetItem = {
  itemType: number;
  itemId: number;
};

export type BudgetSummary = {
  budgetId: number;
  description: string;
  icon: string;
  budgetTotal: number;
  spentTotal: number;
  remaining: number;
};

export type BudgetFormData = {
  budget?: UpdateBudget;
  currencies: CatalogItem[];
  onSaved: (budget: AddBudget) => void;
};

export type BudgetItemsFormData = {
  budgetId: number;
  expenseTypes: CatalogItem[];
  vendors: CatalogItem[];
  currentItems: BudgetItemDetail[];
  onItemAdded: (item: AddBudgetItem) => void;
  onItemRemoved: (itemId: number) => void;
};

export type PeriodType = 'week' | 'month' | 'year';

export const PERIOD_LABELS: Record<PeriodType, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

export type SummaryRequest = {
  period: PeriodType;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
};

export const EMPTY_ADD_BUDGET: AddBudget = {
  ownerId: 1,
  currencyId: 0,
  description: '',
  icon: 'account_balance_wallet',
  total: 0,
};
