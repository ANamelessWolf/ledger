export type MontlyInstallmentFilter = {
  creditcardId?: number[];
  archived?: number;
  status?: 'active' | 'inactive' | 'all';
  fromMonth?: number;
  fromYear?: number;
  toMonth?: number;
  toYear?: number;
  walletGroupId?: number;
};
