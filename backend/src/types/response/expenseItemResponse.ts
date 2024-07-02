export type ExpenseItemResponse = {
  id: number;
  walletId: number;
  wallet: string;
  expenseTypeId: number;
  expenseType: string;
  expenseIcon: string;
  vendorId: number;
  vendor: string;
  vendorIcon: string;
  description: string;
  total: string;
  value: number;
  buyDate: string;
};
