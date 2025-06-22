import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_monthly_creditcard_installments".toLowerCase(),
  expression: `SELECT * FROM vw_monthly_creditcard_installments`,
})
export class MonthlyCreditCardInstallments {
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