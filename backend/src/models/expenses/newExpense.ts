export type NewExpense = {
  total: number;
  description: string;
  walletId: number;
  expenseTypeId: number;
  vendorId: number;
  buyDate?: Date;
};

export const emptyNewExpense: NewExpense = {
  total: 0, 
  description: '', 
  walletId: 0,
  expenseTypeId: 0, 
  vendorId: 0, 
  buyDate: undefined 
};
