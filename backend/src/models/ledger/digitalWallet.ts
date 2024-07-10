import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Wallet } from "./wallet";
import { getObject } from "../../utils/dbUtils";

@Entity('Digital_Wallet_Payment_Wallet', { database: process.env.DB_NAME })
export class DigitalWallet {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "digital_wallet_id" })
  digitalWalletId: number;

  @Column({ type: "int", name: "payment_wallet_id" })
  paymentWalletId: number;

  get digitalWallet(){
    return getObject(Wallet,this.digitalWalletId);
  }

  get paymentWallet(){
    return getObject(Wallet,this.paymentWalletId);
  }

}
