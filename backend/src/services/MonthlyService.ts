import { AppDataSource } from "..";
import { Expense } from "../models/expenses";
import { MonthlyNonInterest } from "../models/banking/monthlyNonInterest";
import { MonthlyNonInterestPayment } from "../models/banking/monthlyNonInterestPayment";
import { MonthlyPaymentPayload, MonthlyWizardPayload } from "../types/monthlyWizardPayload";

const buildExpense = (data: MonthlyPaymentPayload): Expense => {
  const expense = new Expense();
  expense.walletId = data.walletId;
  expense.expenseTypeId = data.expenseTypeId;
  expense.vendorId = data.vendorId;
  expense.description = data.description;
  expense.buyDate = data.buyDate as any;
  expense.total = data.total;
  expense.sortId = 0;
  return expense;
};

export const createMonthlyInstallment = async (
  payload: MonthlyWizardPayload
): Promise<MonthlyNonInterest> => {
  let mainExpenseId: number;

  if (payload.mainExpenseId) {
    mainExpenseId = payload.mainExpenseId;
  } else if (payload.mainExpense) {
    const mainExpense = buildExpense(payload.mainExpense);
    const savedMain = await AppDataSource.manager.save(mainExpense);
    mainExpenseId = savedMain.id;
  } else {
    throw new Error("Either mainExpenseId or mainExpense must be provided");
  }

  const monthly = new MonthlyNonInterest();
  monthly.creditcardId = payload.creditCardId;
  monthly.expenseId = mainExpenseId;
  monthly.startDate = (payload.mainExpense?.buyDate ?? new Date().toISOString().slice(0, 10)) as any;
  monthly.months = payload.months;
  monthly.paidMonths = 0;
  monthly.archived = 0;
  const savedMonthly = await AppDataSource.manager.save(monthly);

  for (const paymentData of payload.payments) {
    const paymentExpense = buildExpense(paymentData);
    const savedExpense = await AppDataSource.manager.save(paymentExpense);

    const payment = new MonthlyNonInterestPayment();
    payment.buyId = savedMonthly.id;
    payment.expenseId = savedExpense.id;
    payment.isPaid = 0;
    await AppDataSource.manager.save(payment);
  }

  return savedMonthly;
};
