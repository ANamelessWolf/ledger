import { Between, FindManyOptions, In, Like } from "typeorm";
import { ExpenseFilter } from "../types/filter/expenseFilter";
import { Expense } from "../models/expenses";

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
