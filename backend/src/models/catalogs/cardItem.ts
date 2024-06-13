import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_card_list",
  expression: `SELECT * FROM vw_card_list`,
})
export class CardItem {
  @ViewColumn()
  id: number;

  @ViewColumn({ name: "entity_id" })
  entityId: number;

  @ViewColumn({ name: "is_credit_card" })
  isCreditCard: number;

  @ViewColumn()
  entity: string;

  @ViewColumn()
  ending: string;

  @ViewColumn()
  active: number;
}
