export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
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
  status: PaymentStatus;
  expiration: string;
  cardType: number;
  ending: string;
  color: string;
};

export const EMPTY_PAYMENT_STATUS: PaymentStatus = {
  cutDate: '',
  dueDate: '',
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
  card: 'string',
  banking: 'string',
  credit: 'string',
  usedCredit: 'string',
  status: EMPTY_PAYMENT_STATUS,
  expiration: 'string',
  cardType: 0,
  ending: 'string',
  color: 'string',
};