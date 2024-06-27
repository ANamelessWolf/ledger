import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_Spending_Report_Credit_Card",
  expression: `SELECT * FROM VW_Spending_Report_Credit_Card`,
})
export class CreditCardSpendingReport {
  @ViewColumn()
  id: number;

  @ViewColumn({ name: "entity_id" })
  entityId: number;

  @ViewColumn()
  name: string;
  
  @ViewColumn()
  entity: string;

  @ViewColumn()
  ending: string;

  @ViewColumn()
  active: number;

  @ViewColumn({ name: "period_cut_date" })
  cutDate: Date;
  
  @ViewColumn()
  period: string;

  @ViewColumn()
  payment: number;

}
