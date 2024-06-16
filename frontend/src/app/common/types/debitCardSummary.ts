export type DebitCardSummary = {
  id: number;
  walletId: number;
  entityId: number;
  card: string;
  banking: string;
  interest_rate: string;
  total: string;
  expiration: string;
  cardType: number;
  ending: string;
  color: string;
};


export const EMPTY_DEBIT_CARD_SUMMARY: DebitCardSummary = {
  id: 0,
  walletId: 0,
  entityId: 0,
  card: '',
  banking: '',
  interest_rate: '',
  total: '',
  expiration: '',
  cardType: 0,
  ending: '',
  color: '',
};
