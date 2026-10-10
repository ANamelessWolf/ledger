import { ExpenseRange } from "./expenseFilter";

export type WalletExpenseFilter = {
  expenseTypes?: number[];
  vendors?: number[];
  // Calendar dates (YYYY-MM-DD), both inclusive
  period?: { start: string; end: string };
  expenseRange?: ExpenseRange;
  description?: string;
};
