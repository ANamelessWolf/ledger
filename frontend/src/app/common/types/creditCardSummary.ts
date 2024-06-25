import { CardType } from "./cardItem";

export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
  payment: {
    startDate: Date;
    dueDate: Date;
  };
  billing: {
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};

export type CreditCardSummary = {
  id: number;
  walletId: number;
  entityId: number;
  card: string;
  banking: string;
  credit: string;
  usedCredit: string;
  available:string;
  status: PaymentStatus;
  expiration: string;
  type: CardType;
  ending: string;
  color: string;
};

export const EMPTY_PAYMENT_STATUS: PaymentStatus = {
  cutDate: '',
  dueDate: '',
  payment: {
    startDate: new Date(),
    dueDate: new Date(),
  },
  billing: {
    period: '',
    start: '',
    end: '',
  },
  status: '',
  total: '',
};

export const EMPTY_CREDIT_CARD_SUMMARY: CreditCardSummary = {
  id: 0,
  walletId: 0,
  entityId: 0,
  card: '',
  banking: '',
  credit: '',
  usedCredit: '',
  available: '',
  status: EMPTY_PAYMENT_STATUS,
  expiration: '',
  type: CardType.OTHER,
  ending: '',
  color: '',
};
