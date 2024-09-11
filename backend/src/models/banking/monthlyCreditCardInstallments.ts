import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_MONTHLY_CREDITCARD_INSTALLMENTS",
  expression: `SELECT * FROM VW_MONTHLY_CREDITCARD_INSTALLMENTS`,
})
export class monthlyCreditCardInstallments {
  @ViewColumn()
  creditCardId: number;

  @ViewColumn()
  period: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  color: string;

  @ViewColumn()
  balance: number;

  @ViewColumn()
  paid: number;

  @ViewColumn()
  total: number;

}