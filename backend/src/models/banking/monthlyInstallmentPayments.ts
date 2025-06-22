import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_monthly_installment_payments",
  expression: `SELECT * FROM vw_monthly_installment_payments`,
})
export class MonthlyInstallmentPayment {

  @ViewColumn()
  id: number;

  @ViewColumn()
  paymentId: number;

  @ViewColumn()
  creditCardId: number;

  @ViewColumn()
  wallet: string;

  @ViewColumn()
  expenseBuyId: number;
  
  @ViewColumn()
  buyTotalValue: number;

  @ViewColumn()
  expenseId: number;

  @ViewColumn()
  expense: string;

  @ViewColumn()
  expenseTypeId: number;

  @ViewColumn()
  expenseType: string;

  @ViewColumn()
  icon: string;

  @ViewColumn()
  vendorId: number;

  @ViewColumn()
  vendor: string;

  @ViewColumn()
  currencyId: number;

  @ViewColumn()
  currency: string;

  @ViewColumn()
  total: number;

  @ViewColumn()
  value: number;

  @ViewColumn()
  buyDate: Date;

  @ViewColumn()
  archived: number;

  @ViewColumn()
  isPaid: number;

}