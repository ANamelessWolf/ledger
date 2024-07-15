import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_Expense_Daily",
  expression: `SELECT * FROM VW_Expense_Daily`,
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
