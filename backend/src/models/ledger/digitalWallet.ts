import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { AppDataSource } from "../../index";
import { Wallet } from "./wallet";

@Entity('Digital_Wallet_Payment_Wallet', { database: process.env.DB_NAME })
export class DigitalWallet {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "digital_wallet_id" })
  digitalWalletId: number;

  @Column({ type: "int", name: "payment_wallet_id" })
  paymentWalletId: number;

  get digitalWallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.digitalWalletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

  get paymentWallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.paymentWalletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

}
