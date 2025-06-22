import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_creditcard_payments",
  expression: `SELECT * FROM vw_creditcard_payments`,
})
export class CreditCardSpendingReport {
  @ViewColumn()
  id: number;

  @ViewColumn()
  cutDay: number;

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

  @ViewColumn({ name: "payment_date" })
  paymentDate: Date;

  @ViewColumn()
  payment: number;

}
