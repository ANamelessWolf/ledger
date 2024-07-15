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
