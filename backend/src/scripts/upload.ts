import dotenv from "dotenv";
import { DataSource } from "typeorm";
import {
  FinancingEntity,
  MonthlyNonInterest,
  MonthlyNonInterestPayment,
} from "../models/banking";
import { MonthlyCreditCardInstallments } from "../models/banking/monthlyCreditCardInstallments";
import { MonthlyInstallmentPayment } from "../models/banking/monthlyInstallmentPayments";
import {
  CardItem,
  ExpenseType,
  FinancingType,
  Vendor,
  WalletType,
} from "../models/catalogs";
import { Credit, DailyExpense, Expense } from "../models/expenses";
import {
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
  WalletList,
  WalletMember,
} from "../models/ledger";
import { Beneficiary, LendMoney } from "../models/lend";
import { Currency, Owner, PaymentFrequency } from "../models/settings";
import {
  Subscription,
  SubscriptionPaymentHistory,
} from "../models/subscriptions";
import { ExcelExpenseUploader } from "../utils/expenseUploader";
import { ExpenseRow, UploadResult } from "../types/excelTypes";

dotenv.config();

const createConnection = (): DataSource => {
  return new DataSource({
    type: "mysql",
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

const AppDataSource = createConnection();
const EXCEL_PATH =
  "C:\\Users\\migue\\OneDrive\\Documentos\\Excel\\LedgerExpense.xlsx";

const init = async () => {
  try {
    //Connect to the database
    const connResult = await AppDataSource.initialize();
    if (connResult.isInitialized) {
      console.log(`Connected to the database`);
    }

    const wallets: WalletList[] = await AppDataSource.manager.find(WalletList);
    const expenseUploader: ExcelExpenseUploader = new ExcelExpenseUploader(
      EXCEL_PATH,
      wallets
    );

    const expensesData: ExpenseRow[] = expenseUploader.process();
    //console.log(expensesData);
     const result: UploadResult = await expenseUploader.upload(
       AppDataSource,
       expensesData
     );
    console.log(result.succed, result.failed);

    console.log("Closing...");
    process.exit(1);
  } catch (err) {
    console.error("Something went wrong while starting the server", err);
    process.exit(1);
  }
};

init();
