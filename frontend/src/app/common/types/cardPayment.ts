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

