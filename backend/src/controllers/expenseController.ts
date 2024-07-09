import { NextFunction, Request, Response } from "express";
import {
  Exception,
  HTTP_STATUS,
  HttpResponse,
  PAGINATION_SIZE,
} from "../common";
import { asyncErrorHandler } from "../middlewares";
import { ExpenseFilter } from "../types/filter/expenseFilter";
import { getExpenseFilter } from "../utils/expenseUtils";
import QueryString from "qs";
import { Expense } from "../models/expenses";
import { AppDataSource } from "..";
import { FindManyOptions } from "typeorm";
import { ExpenseItemResponse } from "../types/response/expenseItemResponse";
import { Wallet } from "../models/ledger";
import { ExpenseType, Vendor } from "../models/catalogs";
import { formatMoney } from "../utils/formatUtils";
import { Currency } from "../models/settings";
import { formatDate, parseDate } from "../utils/dateUtils";

/**
 * Retrieves a list of expenses.
 * @summary Retrieves list of expenses filtered or not filtered.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getExpenses = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = buildFilter(req.query);
      const where = getExpenseFilter(filter);
      const options: FindManyOptions<Expense> = { where };

      // Add sorting
      const { orderBy, orderDirection } = req.query;
      if (orderBy !== undefined) {
        const field = orderBy.toString();
        const sortBy = orderDirection !== undefined ? orderDirection : "ASC";
        options.order = { [field]: sortBy };
      }else{
        options.order = { ['buyDate']: 'DESC' };
      }

      // Add pagination
      const { skip, take } = getPagination(req.query);
      options.skip = skip;
      options.take = take;

      const count = await AppDataSource.manager.count(Expense, { where });

      const expenses: Expense[] = await AppDataSource.manager.find(
        Expense,
        options
      );
      const result: ExpenseItemResponse[] = [];
      for (let index = 0; index < expenses.length; index++) {
        const ex: Expense = expenses[index];
        const wallet: Wallet = (await ex.wallet)[0];
        const currency: Currency = (await wallet.currency)[0];
        const exType: ExpenseType = (await ex.expenseType)[0];
        const vendor: Vendor = (await ex.vendor)[0];
        const exDate:Date = parseDate(ex.buyDate);
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
        result.push(item);
      }
      const pagination = {
        page: req.query.page,
        pageSize: take,
        total: count,
      };
      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: { result, pagination },
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred getting the credit card summary`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Submit a new expense to the expense table
 * @summary Handles adding a new expense
 * @route POST /expenses
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const createExpense = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        total,
        buyDate,
        description,
        walletId,
        expenseTypeId,
        vendorId,
      } = req.body;
      // Create a new instance of CreditcardPayment
      const expense = new Expense();
      expense.walletId = walletId;
      expense.expenseTypeId = expenseTypeId;
      expense.vendorId = vendorId;
      expense.description = description;
      expense.buyDate = buyDate;
      expense.total = total;

      // Save the insert record
      const result = await AppDataSource.manager.save(expense);
      
      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred adding a new Expense`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Updates an expense table
 * @summary Handles updating an existant expense
 * @route PUT /expenses/:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const updateExpense = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const where: any = { id: id };
      const expenses: Expense[] = await AppDataSource.manager.find(Expense, {
        where,
      });

      // Validate id
      if (expenses.length === 0) {
        return next(new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST));
      }
      // Get the current Creditcard
      const expense: Expense = expenses[0];
      const {
        total,
        buyDate,
        description,
        walletId,
        expenseTypeId,
        vendorId,
      } = req.body;
      // Update the expense
      expense.walletId = walletId;
      expense.expenseTypeId = expenseTypeId;
      expense.vendorId = vendorId;
      expense.description = description;
      expense.buyDate = buyDate;
      expense.total = total;

      // Save the insert record
      const result = await AppDataSource.manager.save(expense);

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred updating a new Expense`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

const buildFilter = (query: QueryString.ParsedQs): ExpenseFilter => {
  const { wallet, expenseTypes, vendors, start, end, min, max, description } =
    query;

  const filter: ExpenseFilter = {
    wallet:
      wallet
        ?.toString()
        .split(",")
        .map((id) => +id) || undefined,
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
