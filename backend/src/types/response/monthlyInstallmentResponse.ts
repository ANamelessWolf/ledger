import { PairedValue } from "../../common";
import { CardBalance } from "../cardBalance";

export type PurchaseExpense = {
  id: number;
  creditCardId: number;
  card: string;
  walletGroupId: number;
  description: string;
  vendorId: number;
  vendor: string;
  total: string;
  value: number;
};

export type MonthlyPayment = {
  id: number;
  purchaseId: number;
  expenseId: number;
  expenseTypeId: number;
  expenseType: string;
  expenseIcon: string;
  description: string;
  total: string;
  value: number;
  payDate: string;
  expenseDate: Date;
  isPaid: boolean;
};

export type MonthlyInstallmentResponse = {
  id: number;
  startDate: Date;
  buyDate: string;
  purchase: PurchaseExpense;
  payments: MonthlyPayment[];
  months: number;
  paidMonths: number;
  isArchived: boolean;
};

export type CreditCardInstallmentTotal = {
  currentPeriod: PairedValue;
  cards: CardBalance[];
  totals: InstallmentTotal;
  summary: {
    labels: string[];
    balance: number[];
    payment: number[];
  };
};

export type InstallmentTotal = {
  monthlyBalance: number;
  balance: number;
  total: number;
};
