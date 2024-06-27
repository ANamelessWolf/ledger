import { CardSpending } from "../cardSpending";

export type CardSpendingResponse = {
  id: number;
  entity_id: number;
  name: string;
  banking: string;
  ending: string;
  active: number;
  average: string;
  max: string;
  min: string;
  spending: CardSpending[];
};
