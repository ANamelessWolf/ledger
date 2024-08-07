import { DateRange, ExpenseRange } from "./expenseFilter";

export type WalletExpenseFilter = {
  parentWalletGroupId: number;
  walletGroupId: number;
  expenseTypes?: number[];
  vendors?: number[];
  period?: DateRange;
  expenseRange?: ExpenseRange;
  description?: string;
};
