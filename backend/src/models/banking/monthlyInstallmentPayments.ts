import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_MONTHLY_INSTALLMENT_PAYMENTS",
  expression: `SELECT * FROM VW_MONTHLY_INSTALLMENT_PAYMENTS`,
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