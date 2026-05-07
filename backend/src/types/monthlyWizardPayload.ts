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
