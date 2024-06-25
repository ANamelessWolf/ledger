export type CreditCardPaymentBody = {
  total: number;
  payDate: string;
  cutDate: string;
  dueDate: string;
};
export type CreditCardPaymentRequest = {
  id: number;
  body: CreditCardPaymentBody;
};

export type CreditCardBody = {
  entityId?: number;
  walletId?: number;
  credit: number;
  usedCredit: number;
  cutDay: number;
  dueDay: number;
  expiration: string;
  cardType?: number;
  ending: string;
  color: string;
  active: number;
};

export type CreditCardRequest = {
  id: number;
  body: CreditCardPaymentBody;
};
