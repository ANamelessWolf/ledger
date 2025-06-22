import { DataSource } from "typeorm";
import { FinancingEntity, MonthlyNonInterest, MonthlyNonInterestPayment } from "./models/banking";
import {
  ExpenseType,
  WalletType,
  FinancingType,
  Vendor,
  CardItem,
} from "./models/catalogs";
import { Credit, DailyExpense, Expense } from "./models/expenses";
import {
  Cash,
  CreditCardSpendingReport,
  Creditcard,
  CreditcardPayment,
  Debitcard,
  DigitalWallet,
  Investment,
  Saving,
  Wallet,
  WalletExpense,
  WalletGroup,
  WalletMember,
  WalletList,
} from "./models/ledger";
import { Beneficiary, LendMoney } from "./models/lend";
import { Currency, Owner, PaymentFrequency } from "./models/settings";
import {
  Subscription,
  SubscriptionPaymentHistory,
} from "./models/subscriptions";
import { MonthlyCreditCardInstallments } from "./models/banking/monthlyCreditCardInstallments";
import { MonthlyInstallmentPayment } from "./models/banking/monthlyInstallmentPayments";

export const createConnection = (): DataSource => {
  return new DataSource({
    type: "mysql",
    driver: require("mysql2"),
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [
      FinancingEntity,
      MonthlyNonInterest,
      MonthlyNonInterestPayment,
      MonthlyCreditCardInstallments,
      MonthlyInstallmentPayment,
      ExpenseType,
      WalletType,
      FinancingType,
      Vendor,
      CardItem,
      Credit,
      Expense,
      DailyExpense,
      Cash,
      Creditcard,
      CreditcardPayment,
      CreditCardSpendingReport,
      Debitcard,
      DigitalWallet,
      Investment,
      Saving,
      Wallet,
      WalletExpense,
      WalletGroup,
      WalletMember,
      WalletList,
      Beneficiary,
      LendMoney,
      Currency,
      Owner,
      PaymentFrequency,
      Subscription,
      SubscriptionPaymentHistory,
    ],
    subscribers: [],
    migrations: ["./migrations/*.ts"],
  });
};
