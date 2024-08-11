import { DateRange, ExpenseRange } from "./expenseFilter";

export type WalletExpenseFilter = {
  expenseTypes?: number[];
  vendors?: number[];
  period?: DateRange;
  expenseRange?: ExpenseRange;
  description?: string;
};
