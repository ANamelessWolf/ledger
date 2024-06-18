export enum CARD_STATUS {
  ACTIVE = 1,
  CANCELLED = 2,
  INACTIVE = 0,
  OTHER = 99
}

export type CardItem = {
  id: number;
  entityId: number;
  isCreditCard: boolean;
  name: string;
  entity: string;
  status: string;
  ending: string;
  active: CARD_STATUS;
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
  active: CARD_STATUS.OTHER,
  isSelected: false,
};

export enum PAYMENT_STATUS {
  UNDEFINED = 'Not defined',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  NOT_REQUIRED = 'Not required',
}
