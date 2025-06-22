import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_expense_daily",
  expression: `SELECT * FROM vw_expense_daily`,
})
export class DailyExpense {
  @ViewColumn()
  total: number;

  @ViewColumn()
  buyDate: Date;

  @ViewColumn()
  dayId: number;

  @ViewColumn()
  monthId: number;

  @ViewColumn()
  yearId: number;

  @ViewColumn()
  weekDay: number;

}
