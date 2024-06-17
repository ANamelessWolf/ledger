export type CardItem = {
  id: number;
  entityId: number;
  isCreditCard: boolean;
  name: string;
  entity: string;
  status:string;
  ending: string;
  active: boolean;
  isSelected: boolean;
};

export const EMPTY_CARD_ITEM: CardItem = {
  id: 0,
  entityId: 0,
  isCreditCard: false,
  entity: '',
  status: '',
  name: '',
  ending: '',
  active: false,
  isSelected: false,
};

export enum PAYMENT_STATUS {
  UNDEFINED = "Not defined",
  PENDING = "Pending",
  PAID = "Paid",
  OVERDUE = "Overdue",
  NOT_REQUIRED = "Not required",
}
