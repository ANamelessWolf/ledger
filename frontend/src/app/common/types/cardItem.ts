import { CatalogItem, SelectItem } from '@common/types/catalogTypes';
import { HEADERS } from '@config/messages';

export enum CARD_STATUS {
  ACTIVE = 1,
  CANCELLED = 2,
  INACTIVE = 0,
  ANY = 98,
  OTHER = 99,
}

export const CARD_STATUS_KEYS = {
  1: HEADERS.ACT,
  2: HEADERS.CANCELED,
  0: HEADERS.N_ACT,
  98: HEADERS.ANY,
  99: HEADERS.OTHER,
};

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

export type CardFilter = {
  entityId: number;
  crediCardType: number;
  active: number;
};

export type CardFilterOptions = {
  entities: CatalogItem[];
  filter?: CardFilter;
  cardStatus: SelectItem[];
};


