import { Between, FindManyOptions, In, Like } from "typeorm";
import { ExpenseFilter } from "../types/filter/expenseFilter";
import { Expense } from "../models/expenses";
import { ExpenseItemResponse } from "../types/response/expenseItemResponse";
import { formatMoney } from "./formatUtils";
import { formatDate, parseDate } from "./dateUtils";
import { Exception, HTTP_STATUS } from "../common";
import { Wallet, WalletExpense } from "../models/ledger";
import { ExpenseType, Vendor } from "../models/catalogs";
import { Currency } from "../models/settings";
import { WalletExpenseFilter } from "../types/filter/walletExpenseFilter";

/**
 *
 * @param filter
 * @returns
 */
export const getExpenseFilter = (
  filter: ExpenseFilter
): FindManyOptions<Expense>["where"] => {
  const where: FindManyOptions<Expense>["where"] = {};

  if (filter.wallet && filter.wallet.length > 0) {
    where.walletId = In(filter.wallet);
  }

  if (filter.expenseTypes && filter.expenseTypes.length > 0) {
    where.expenseTypeId = In(filter.expenseTypes);
  }

  if (filter.vendors && filter.vendors.length > 0) {
    where.vendorId = In(filter.vendors);
  }

  if (filter.period) {
    where.buyDate = Between(filter.period.start, filter.period.end);
  }

  if (filter.expenseRange) {
    where.total = Between(filter.expenseRange.min, filter.expenseRange.max);
  }

  if (filter.description) {
    where.description = Like(`%${filter.description}%`);
  }

  return where;
};

export const getWalletExpenseFilter = (
  walletGroupId: number,
  filter: WalletExpenseFilter
): FindManyOptions<WalletExpense>["where"] => {
  // Initial OR condition for walletGroupId
  const where: FindManyOptions<WalletExpense>["where"] = {};

  where.walletGroupId = walletGroupId;
  where.parentWalletGroupId = In([walletGroupId, 0]);

  if (filter.expenseTypes && filter.expenseTypes.length > 0) {
    where.expenseTypeId = In(filter.expenseTypes);
  }

  if (filter.vendors && filter.vendors.length > 0) {
    where.vendorId = In(filter.vendors);
  }

  if (filter.period) {
    where.buyDate = Between(filter.period.start, filter.period.end);
  }

  if (filter.expenseRange) {
    where.total = Between(filter.expenseRange.min, filter.expenseRange.max);
  }

  if (filter.description) {
    where.description = Like(`%${filter.description}%`);
  }

  return where;
};

export const getExpenseItemResponse = async (
  ex: Expense
): Promise<ExpenseItemResponse> => {
  const wallet = await getWallet(ex);
  const currency: Currency = await getCurrency(ex, wallet);
  const exType: ExpenseType = await getExpenseType(ex);
  const vendor: Vendor = await getVendor(ex);
  // Expense date
  const exDate: Date = parseDate(ex.buyDate.toString());

  const item: ExpenseItemResponse = {
    ...ex,
    wallet: wallet.name,
    expenseType: exType.description,
    expenseIcon: exType.icon,
    vendor: vendor.description,
    total: formatMoney(ex.total, `${currency.symbol} $`),
    value: ex.total * currency.conversion,
    buyDate: formatDate(exDate),
  };
  return item;
};

export const getWallet = async (expense: Expense) => {
  const wallet: Wallet | null = await expense.wallet;
  if (wallet === null)
    throw new Exception(
      `Expense has an invalid id(${expense.walletId}) for the given wallet`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return wallet;
};

export const getCurrency = async (expense: Expense, wallet?: Wallet) => {
  if (!wallet) {
    wallet = await getWallet(expense);
  }
  const currency: Currency | null = await wallet.currency;
  if (currency === null)
    throw new Exception(
      `Wallet has an invalid id(${wallet.currencyId}) for currency`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return currency;
};

export const getExpenseType = async (expense: Expense) => {
  const expenseType: ExpenseType | null = await expense.expenseType;
  if (expenseType === null)
    throw new Exception(
      `Expense type has an invalid id(${expense.expenseTypeId}) for expense type`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return expenseType;
};

export const getVendor = async (expense: Expense) => {
  const vendor: Vendor | null = await expense.vendor;
  if (vendor === null)
    throw new Exception(
      `Vendor has an invalid id(${expense.vendorId}) for vendor`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return vendor;
};
