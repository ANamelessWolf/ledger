import { PaymentStatus } from "../paymentStatus";

export type CreditCardSummary = {
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
  cardType: number;
  ending: string;
  color: string;
  type: number;
  cutday: number;
};
