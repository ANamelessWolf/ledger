import { MonthlyCreditCardInstallments } from "../models/banking/MonthlyCreditCardInstallments";
import { CardBalance } from "../types/cardBalance";
import { PeriodBalance } from "../types/periodBalance";
import { CreditCardInstallmentTotal } from "../types/response/monthlyInstallmentResponse";
import { getPeriodLabel } from "./dateUtils";

export class CreditCardMonthlyInstTot {
  private cards: { [key: string]: CardBalance };
  private periods: { [key: string]: PeriodBalance };
  private summary: PeriodBalance[];
  private monthlyBalance: number;
  private balance: number;
  private total: number;
  private currentPeriod: number;

  static getCurrentPeriod(): number {
    const today = new Date();
    const currentMonth = today.getMonth().toString().padStart(2, "0");
    const currentPeriod: number = +`${today.getFullYear()}${currentMonth}`;
    return currentPeriod;
  }

  get currentLabelPeriod(): string {
    return getPeriodLabel(this.currentPeriod);
  }

  get cardsBalance(): CardBalance[] {
    return Object.keys(this.cards).map((key: string) => this.cards[key]);
  }

  get summaryLabels(): string[] {
    return this.summary.map((x) => x.label);
  }

  get summaryBalance(): number[] {
    return this.summary.map((x) => x.balance);
  }
  get summaryExpendedTotal(): number[] {
    return this.summary.map((x) => x.total);
  }

  constructor() {
    this.cards = {};
    this.periods = {};
    this.monthlyBalance = 0;
    this.balance = 0;
    this.total = 0;
    this.currentPeriod = CreditCardMonthlyInstTot.getCurrentPeriod();
  }

  updateBalance(installment: MonthlyCreditCardInstallments) {
    this.addPeriodBalance(installment);
    this.balance += installment.balance;
    this.total += installment.total;
    if (installment.period === this.currentPeriod) {
      this.monthlyBalance += installment.balance;
    }
    this.addCardBalance(installment);
  }

  addCardBalance(installment: MonthlyCreditCardInstallments) {
    const key = installment.name;
    if (this.cards[key] !== undefined) {
      this.cards[key].value += installment.balance;
    } else {
      this.cards[key] = {
        id: installment.creditCardId,
        card: installment.name,
        color: installment.color,
        value: installment.balance,
      };
    }
  }

  addPeriodBalance(installment: MonthlyCreditCardInstallments) {
    const label = getPeriodLabel(installment.period);
    if (this.periods[label] !== undefined) {
      this.periods[label].balance += installment.balance;
      this.periods[label].total += installment.total;
    } else {
      this.periods[label] = {
        balance: installment.balance,
        label,
        period: installment.period,
        total: installment.total,
      };
    }
  }

  asTotalResponse(): CreditCardInstallmentTotal {
    this.calculateSummary();
    const result = {
      currentPeriod: {
        label: this.currentLabelPeriod,
        value: this.currentPeriod,
      },
      cards: this.cardsBalance,
      totals: {
        monthlyBalance: this.monthlyBalance,
        balance: this.balance,
        total: this.total,
      },
      summary: {
        labels: this.summaryLabels,
        balance: this.summaryBalance,
        payment: this.summaryExpendedTotal,
      },
    };
    return result;
  }

  private calculateSummary() {
    const summary = Object.keys(this.periods).map(
      (key: string) => this.periods[key]
    );
    summary.sort(function (a, b) {
      return a.period - b.period;
    });
  }
}
