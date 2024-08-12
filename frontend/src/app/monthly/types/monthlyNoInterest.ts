export interface IFreeMontlyInt {
  current: number;
  monthly: number;
  total: number;
}

export const EMPTY_FREE_MONTHLY_INT = {
  current: 0,
  monthly: 0,
  total: 0,
};

export interface ICardValue {
  card: string;
  color: string;
  value: number;
}
