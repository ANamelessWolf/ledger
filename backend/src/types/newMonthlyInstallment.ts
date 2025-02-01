import { CardBalance } from "./cardBalance";

export interface NewMonthlyInstallment {
  creditCardId: number;
  expenseId: number;
  months: number;
}

export type CreditCardCutDays = Record<number, number>;
export type ClassifiedPayments = Record<string, number>;
export type CreditCardInstallmentTotals = Record<string, CardBalance[]>;

export type InstallmentInfo = {
  creditCardId: number;
  buyTotalValue: number;
  payments: ClassifiedPayments;
  burnOutPayments: ClassifiedPayments;
};

export type ClassifiedInstallment = Record<number, InstallmentInfo>;

export type MonthlyInstallmentTotal = {
  label: string;
  monthKey: string;
  balance: number;
  payment: number;
};
