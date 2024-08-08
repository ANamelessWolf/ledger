import { NextFunction, Request, Response } from "express";
import {
  Exception,
  HTTP_STATUS,
  HttpResponse,
  PAGINATION_SIZE,
} from "../common";
import { asyncErrorHandler } from "../middlewares";
import { getWalletExpenseFilter } from "../utils/expenseUtils";
import QueryString from "qs";
import { AppDataSource } from "..";
import { FindManyOptions } from "typeorm";
import { ExpenseItemResponse } from "../types/response/expenseItemResponse";
import { WalletExpense } from "../models/ledger";
import { WalletExpenseFilter } from "../types/filter/walletExpenseFilter";
import { formatMoney } from "../utils/formatUtils";
import { formatDate } from "../utils/dateUtils";

/**
 * Get the wallet expenses by given in a wallet group id
 * @summary The expenses wallet id
 * @route GET /wallet/expenses/:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const getExpensesById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletGroupId: number = +req.params.id;
      const filter = buildFilter(req.query);
      const where: any = getWalletExpenseFilter(walletGroupId, filter);
      const options: FindManyOptions<WalletExpense> = { where };
      // Add sorting
      const { orderBy, orderDirection } = req.query;
      if (orderBy !== undefined) {
        const field = orderBy.toString();
        const sortBy = orderDirection !== undefined ? orderDirection : "ASC";
        options.order = { [field]: sortBy };
      } else {
        options.order = { ["buyDate"]: "DESC" };
      }

      // Add pagination
      const { skip, take } = getPagination(req.query);
      options.skip = skip;
      options.take = take;

      const count = await AppDataSource.manager.count(WalletExpense, { where });
      const totalExpense = await getTotalSum(where);
      const expenses: WalletExpense[] = await AppDataSource.manager.find(
        WalletExpense,
        options
      );

      const result: ExpenseItemResponse[] = [];
      for (let index = 0; index < expenses.length; index++) {
        try {
          const ex: WalletExpense = expenses[index];
          const item: ExpenseItemResponse = {
            id: ex.id,
            walletId: ex.walletId,
            wallet: ex.wallet,
            expenseTypeId: ex.expenseTypeId,
            expenseType: ex.expenseType,
            expenseIcon: ex.expenseIcon,
            vendorId: ex.vendorId,
            vendor: ex.vendor,
            description: ex.description,
            total: formatMoney(ex.total, `${ex.currency} $`),
            value: ex.value,
            buyDate: formatDate(ex.buyDate),
          };
          result.push(item);
        } catch (error) {
          console.log(error);
        }
      }

      const pagination = {
        page: req.query.page,
        pageSize: take,
        total: count,
      };

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: { result, pagination, total: totalExpense },
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred selecting the wallet expenses`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

const buildFilter = (query: QueryString.ParsedQs): WalletExpenseFilter => {
  const { expenseTypes, vendors, start, end, min, max, description } = query;

  const filter: WalletExpenseFilter = {
    expenseTypes:
      expenseTypes
        ?.toString()
        .split(",")
        .map((id) => +id) || undefined,
    vendors:
      vendors
        ?.toString()
        .split(",")
        .map((id) => +id) || undefined,
    period:
      start !== undefined && end !== undefined
        ? {
            start: new Date(start.toString()),
            end: new Date(end.toString()),
          }
        : undefined,
    expenseRange:
      min !== undefined && max !== undefined
        ? {
            min: +min.toString(),
            max: +max.toString(),
          }
        : undefined,
    description: description?.toString(),
  };
  return filter;
};

const getPagination = (query: QueryString.ParsedQs) => {
  const { page, pageSize } = query;
  let index: number = 1;
  if (page !== undefined) {
    index = +page.toString();
  }
  let size: number = PAGINATION_SIZE;
  if (pageSize !== undefined) {
    size = +pageSize.toString();
  }
  const skip = (index - 1) * size;
  const take = size;
  return { skip, take };
};

const getTotalSum = async (where: any): Promise<number> => {
  const sumResult = await AppDataSource.getRepository(WalletExpense)
    .createQueryBuilder("VW_Wallet_Expense")
    .select("SUM(VW_Wallet_Expense.total)", "sum")
    .where(where)
    .getRawOne();

  return sumResult.sum ? parseFloat(sumResult.sum) : 0;
};
