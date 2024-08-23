import { FindManyOptions, In } from "typeorm";
import { MontlyInstallmentFilter as MonthlyInstallmentFilter } from "../types/filter/montlyInstallmentFilter";
import {
  MonthlyNonInterest,
  MonthlyNonInterestPayment,
} from "../models/banking";
import {
  MonthlyInstallmentResponse,
  MonthlyPayment,
} from "../types/response/monthlyInstallmentResponse";
import { Exception, HTTP_STATUS } from "../common";
import { formatDate, parseDate } from "./dateUtils";
import { Expense } from "../models/expenses";
import { Creditcard, WalletGroup } from "../models/ledger";
import { getCurrency, getExpenseType, getVendor } from "./expenseUtils";
import { Currency } from "../models/settings";
import { formatMoney } from "./formatUtils";
import { ExpenseType, Vendor } from "../models/catalogs";

/**
 *
 * @param filter
 * @returns
 */
export const getMonthlyFilter = (
  filter: MonthlyInstallmentFilter
): FindManyOptions<MonthlyNonInterest>["where"] => {
  const where: FindManyOptions<MonthlyNonInterest>["where"] = {};

  if (filter.creditcardId && filter.creditcardId.length > 0) {
    where.creditcardId = In(filter.creditcardId);
  }

  if (filter.archived) {
    where.archived = In([0, 1]);
  } else {
    where.archived = In([0]);
  }

  return where;
};

export const getMonthlyInstallmentItemResponse = async (
  installment: MonthlyNonInterest
): Promise<MonthlyInstallmentResponse> => {
  // Purchase
  const startDate: Date = parseDate(installment.startDate.toString());
  const purchase: Expense = await getExpensePurchase(installment);
  const creditCard: Creditcard = await getCreditCard(installment);
  const walletGroup: WalletGroup = await getWalletGroup(creditCard);
  const currency: Currency = await getCurrency(purchase);
  const vendor: Vendor = await getVendor(purchase);

  const item: MonthlyInstallmentResponse = {
    id: installment.id,
    startDate: startDate,
    buyDate: formatDate(startDate),
    purchase: {
      id: installment.expenseId,
      creditCardId: creditCard.id,
      card: walletGroup.name,
      description: purchase.description,
      walletGroupId: walletGroup.id,
      vendorId: vendor.id,
      vendor: vendor.description,
      total: formatMoney(purchase.total, `${currency.symbol} $`),
      value: purchase.total * currency.conversion,
    },
    payments: await getPayments(installment),
    months: installment.months,
    paidMonths: installment.paidMonths,
    isArchived: installment.archived === 1,
  };
  return item;
};

export const getWalletGroup = async (creditCard: Creditcard) => {
  const walletGroup: WalletGroup | null = await creditCard.walletGroup;
  if (walletGroup === null)
    throw new Exception(
      `Credit card has an invalid wallet groupId(${creditCard.walletGroupId}).`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return walletGroup;
};

export const getExpensePurchase = async (installment: MonthlyNonInterest) => {
  const purchase: Expense | null = await installment.expense;
  if (purchase === null)
    throw new Exception(
      `Installment has an invalid id(${installment.expenseId}) for the associated expense purchase`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return purchase;
};

export const getCreditCard = async (installment: MonthlyNonInterest) => {
  const creditCard: Creditcard | null = await installment.creditcard;
  if (creditCard === null)
    throw new Exception(
      `Installment has an invalid credit card id(${installment.creditcard}).`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return creditCard;
};

export const geExpensePayment = async (payment: MonthlyNonInterestPayment) => {
  const expensePayment: Expense | null = await payment.expense;
  if (expensePayment === null)
    throw new Exception(
      `Payment has an invalid id(${payment.expenseId}) for the associated expense`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return expensePayment;
};

export const getPayments = async (installment: MonthlyNonInterest) => {
  const items: MonthlyNonInterestPayment[] | null = await installment.payments;
  const payments: MonthlyPayment[] = [];
  if (items !== null && items.length > 0) {
    for (let index = 0; index < items.length; index++) {
      const payment: MonthlyNonInterestPayment = items[index];
      const expense: Expense = await geExpensePayment(payment);
      const expenseDate: Date = parseDate(expense.buyDate.toString());
      const currency: Currency = await getCurrency(expense);
      const expenseType: ExpenseType = await getExpenseType(expense);
      payments.push({
        id: payment.id,
        purchaseId: payment.buyId,
        expenseId: expense.id,
        expenseTypeId: expenseType.id,
        expenseType: expenseType.description,
        expenseIcon: expenseType.icon,
        description: expense.description,
        total: formatMoney(expense.total, `${currency.symbol} $`),
        value: expense.total * currency.conversion,
        payDate: formatDate(expenseDate),
        expenseDate,
        isPaid: payment.isPaid === 1,
      });
    }
  }
  return sortPayments(payments);
};

/**
 * Sorts an array of MonthlyPayment objects by expenseDate in ascending order.
 * @param payments Array of MonthlyPayment objects.
 * @returns Sorted array of MonthlyPayment objects.
 */
const sortPayments = (payments: MonthlyPayment[]): MonthlyPayment[] => {
  return payments.sort(
    (a, b) => a.expenseDate.getTime() - b.expenseDate.getTime()
  );
};