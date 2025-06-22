import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
  name: "vw_wallet_list",
  expression: `SELECT * FROM vw_wallet_list`,
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
