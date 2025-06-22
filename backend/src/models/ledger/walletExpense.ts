import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_Wallet_Expense",
  expression: `SELECT * FROM VW_Wallet_Expense`,
})
export class WalletExpense {

  @ViewColumn()
  id: number;

  @ViewColumn()
  walletId: number;

  @ViewColumn()
  parentWalletGroupId: number;

  @ViewColumn()
  walletGroupId: number;

  @ViewColumn()
  wallet: string;

  @ViewColumn()
  expenseTypeId: number;

  @ViewColumn()
  expenseType: string;

  @ViewColumn()
  expenseIcon: string;

  @ViewColumn()
  vendorId: number;
  
  @ViewColumn()
  vendor: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  total: number;

  @ViewColumn()
  currency: string;

  @ViewColumn()
  value: number;

  @ViewColumn()
  buyDate: Date;

  @ViewColumn()
  isNonIntMonthlyInstallment: number;

  @ViewColumn()
  sortId: number;
  
}
