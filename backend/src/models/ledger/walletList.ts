import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "VW_Wallet_List",
  expression: `SELECT * FROM VW_Wallet_List`,
})
export class WalletList {
  @ViewColumn()
  walletGroupId: number;

  @ViewColumn()
  walletId: number;

  @ViewColumn()
  currencyId: number;

  @ViewColumn()
  wallet: string;

  @ViewColumn()
  currency: string;

}
