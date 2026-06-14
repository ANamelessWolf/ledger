export type ExpenseItemResponse = {
  id: number;
  walletId: number;
  wallet: string;
  expenseTypeId: number;
  expenseType: string;
  expenseIcon: string;
  vendorId: number;
  vendor: string;
  description: string;
  total: string;
  rawTotal: number;
  value: number;
  buyDate: string;
};
