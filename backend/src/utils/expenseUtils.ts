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
  // Wallet Id
  const wallet: Wallet | null = await ex.wallet;
  if (wallet === null)
    throw new Exception(
      `Expense has an invalid id(${ex.walletId}) for wallet`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  // Currency
  const currency: Currency | null = await wallet.currency;
  if (currency === null)
    throw new Exception(
      `Wallet has an invalid id(${wallet.currencyId}) for currency`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  // Expense type
  const exType: ExpenseType | null = await ex.expenseType;
  if (exType === null)
    throw new Exception(
      `Expense type has an invalid id(${ex.expenseTypeId}) for expense type`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  // Vendor
  const vendor: Vendor | null = await ex.vendor;
  if (vendor === null)
    throw new Exception(
      `Vendor has an invalid id(${ex.vendorId}) for vendor`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
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
