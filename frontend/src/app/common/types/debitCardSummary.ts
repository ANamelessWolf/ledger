import { CardType } from './cardItem';

export type DebitCardSummary = {
  id: number;
  walletId: number;
  entityId: number;
  card: string;
  banking: string;
  investmentRate: string;
  yearlyGain: string;
  total: string;
  expiration: string;
  type: CardType;
  ending: string;
  color: string;
  cutDay: number;
};

export const EMPTY_DEBIT_CARD_SUMMARY: DebitCardSummary = {
  id: 0,
  walletId: 0,
  entityId: 0,
  card: '',
  banking: '',
  investmentRate: '',
  yearlyGain: '',
  total: '',
  expiration: '',
  type: CardType.OTHER,
  ending: '',
  color: '',
  cutDay: 0,
};
