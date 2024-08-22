import { CardType } from './cardItem';

export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
  payment: {
    startDate: string;
    dueDate: string;
  };
  billing: {
    filter: {
      start: Date;
      end: Date;
    },
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};

export type CreditCardSummary = {
  objtype: 'CreditCard';
  id: number;
  preferredWalletId: number;
  walletGroupId: number;
  entityId: number;
  card: string;
  banking: string;
  credit: string;
  usedCredit: string;
  available: string;
  status: PaymentStatus;
  expiration: string;
  type: CardType;
  ending: string;
  color: string;
  cutday: number;
};

export const EMPTY_PAYMENT_STATUS: PaymentStatus = {
  cutDate: '',
  dueDate: '',
  payment: {
    startDate: '',
    dueDate: '',
  },
  billing: {
    filter: {
      start: new Date(),
      end: new Date(),
    },
    period: '',
    start: '',
    end: '',
  },
  status: '',
  total: '',
};

export const EMPTY_CREDIT_CARD_SUMMARY: CreditCardSummary = {
  objtype: 'CreditCard',
  id: 0,
  preferredWalletId: 0,
  walletGroupId: 0,
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
  cutday: 0,
};

export type CardSpending = {
  label: string;
  spending: number;
  period: string;
  cutDate: Date;
};

export type CreditCardSpending = {
  id: number;
  entityId: number;
  name: string;
  banking: string;
  ending: string;
  active: number;
  average: string;
  max: string;
  min: string;
  spending: CardSpending[];
};

export const EMPTY_CREDIT_CARD_SPENDING: CreditCardSpending = {
  id: 0,
  entityId: 0,
  name: '',
  banking: '',
  ending: '',
  active: 0,
  average: '',
  max: '',
  min: '',
  spending: [],
};
