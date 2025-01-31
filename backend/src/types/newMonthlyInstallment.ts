export interface NewMonthlyInstallment {
  creditCardId: number;
  expenseId: number;
  months: number;
}

export type ClassifiedPayments = Record<string, number>;