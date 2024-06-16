export type CardItem = {
  id: number;
  entityId: number;
  isCreditCard: boolean;
  name: string;
  entity: string;
  ending: string;
  active: boolean;
  isSelected: boolean;
};

export const EMPTY_CARD_ITEM: CardItem = {
  id: 0,
  entityId: 0,
  isCreditCard: false,
  entity: '',
  name: '',
  ending: '',
  active: false,
  isSelected: false,
};
