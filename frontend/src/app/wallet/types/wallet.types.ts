export interface CurrencyItem {
  id: number;
  name: string;
  symbol: string;
  conversion: number;
  isDefault: boolean;
}

export interface WalletGroupItem {
  id: number;
  name: string;
  isActive: number;
  walletCount: number;
  currencies: string[];
}

export interface WalletMemberItem {
  memberId: number;
  walletId: number;
  walletName: string;
  currencyId: number;
  currencyName: string;
  currencySymbol: string;
  forwardWalletId: number | null;
  forwardWalletName: string | null;
}

export interface WalletGroupDetail {
  id: number;
  name: string;
  members: WalletMemberItem[];
}

export interface WalletItem {
  id: number;
  name: string;
  currencyId: number;
  currencyName: string;
  currencySymbol: string;
  walletGroupId: number | null;
  walletGroupName: string | null;
  walletGroupIsActive: number;
}

export interface CreateWalletGroupPayload {
  name: string;
  currencyIds: number[];
}

export interface UpdateWalletGroupPayload {
  name: string;
}

export interface AddCurrencyToGroupPayload {
  currencyId: number;
  forwardWalletId?: number | null;
}

export interface UpdateMemberPayload {
  forwardWalletId: number | null;
}

export interface CreateCurrencyPayload {
  name: string;
  symbol: string;
  conversion: number;
}

export interface UpdateCurrencyPayload {
  name: string;
  symbol: string;
  conversion: number;
}
