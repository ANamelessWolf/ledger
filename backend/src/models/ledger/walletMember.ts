import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../..";
import { Wallet } from "./wallet";

@Entity("wallet_member", { database: process.env.DB_NAME })
export class WalletMember {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int", name: "wallet_group_id" })
  walletGroupId: number;

  @Column({ type: "int", name: "forward_wallet_id" })
  forwardWalletId: number;

  get wallet(): Promise<Wallet | null> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager
      .find(Wallet, options)
      .then((wallets) => (wallets.length > 0 ? wallets[0] : null))
      .catch((error) => {
        console.error("Error finding wallet:", error);
        return null;
      });
  }
}
