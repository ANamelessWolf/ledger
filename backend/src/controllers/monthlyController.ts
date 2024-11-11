import { NextFunction, Request, Response } from "express";
import {
  Exception,
  HTTP_STATUS,
  HttpResponse,
  PAGINATION_SIZE,
} from "../common";
import { asyncErrorHandler } from "../middlewares";
import QueryString from "qs";
import { FindManyOptions } from "typeorm";
import { AppDataSource } from "..";
import {
  MonthlyNonInterest,
  MonthlyNonInterestPayment,
} from "../models/banking";
import { MontlyInstallmentFilter } from "../types/filter/montlyInstallmentFilter";
import {
  getMonthlyFilter,
  getMonthlyInstallmentItemResponse,
  getMonthlyInstallmentTotals,
  payMonthlyInstallment,
  updatePaidMonths,
} from "../utils/monthlyInstallmentUtils";
import { MonthlyInstallmentResponse } from "../types/response/monthlyInstallmentResponse";
import { MonthlyInstallmentPayment } from "../models/banking/monthlyInstallmentPayments";
import { formatMoney } from "../utils/formatUtils";
import { MonthlyInsPaymentResponse } from "../types/response/monthlyInstallmentPayment";
import { formatDate } from "../utils/dateUtils";
// import { NewMonthlyInstallment } from "../types/newMonthlyInstallment";
// import { Expense } from "../models/expenses";
// import { getExpenseById } from "../utils/expenseUtils";
/**
 * Retrieves a list of all monthly free installments with his asigned payments
 * @summary Retrieves list of montly buys with payments
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getMonthlyInstallments = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = buildFilter(req.query);
      const where = getMonthlyFilter(filter);
      const options: FindManyOptions<MonthlyNonInterest> = { where };

      // Add sorting
      const { orderBy, orderDirection } = req.query;
      if (orderBy !== undefined) {
        const field = orderBy.toString();
        const sortBy = orderDirection !== undefined ? orderDirection : "ASC";
        options.order = { [field]: sortBy };
      } else {
        options.order = { ["startDate"]: "DESC" };
      }

      // Add pagination
      const { skip, take } = getPagination(req.query);
      options.skip = skip;
      options.take = take;

      const count = await AppDataSource.manager.count(MonthlyNonInterest, {
        where,
      });
      const items: MonthlyNonInterest[] = await AppDataSource.manager.find(
        MonthlyNonInterest,
        options
      );

      const result: MonthlyInstallmentResponse[] = [];
      for (let index = 0; index < items.length; index++) {
        try {
          const buy: MonthlyNonInterest = items[index];
          const item: MonthlyInstallmentResponse =
            await getMonthlyInstallmentItemResponse(buy);
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

      const totals = await getMonthlyInstallmentTotals(11, 2023, filter);

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: { result, pagination, totals },
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
 * Get all payments from a monthly installments
 * @route GET /monthly/payments/:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const getMonthlyInstallmentPayment = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const where: any = { id: id };
      const payments: MonthlyInstallmentPayment[] =
        await AppDataSource.manager.find(MonthlyInstallmentPayment, {
          where,
        });

      // Validate id
      if (payments.length === 0) {
        return next(new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST));
      }

      // Format values
      const response: MonthlyInsPaymentResponse[] = payments.map(
        (x: MonthlyInstallmentPayment) => ({
          ...x,
          total: formatMoney(x.total),
          buyDate: formatDate(x.buyDate),
          archived: x.archived === 1,
          isPaid: x.isPaid === 1,
        })
      );

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: response,
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred getting installment payments`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Change an expense to a pay status
 * @route Update /monthly/pay/:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const payInstallment = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.body.id;
      const paymentId: number = +req.body.paymentId;

      const payment: MonthlyNonInterestPayment = await payMonthlyInstallment(
        paymentId
      );

      const where: any = { id: id };
      const payments: MonthlyInstallmentPayment[] =
        await AppDataSource.manager.find(MonthlyInstallmentPayment, {
          where,
        });

      const paidMonths = payments.filter((x) => x.isPaid === 1).length;

      const installment: MonthlyNonInterest = await updatePaidMonths(
        id,
        paidMonths
      );

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: { payment, installment },
        })
      );
    } catch (error) {
      console.log(error);
      return next(
        new Exception(
          `An error occurred getting installment payments`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Create a new monthly expense buy
 * @summary Handles adding a new zero interest monthly installment
 * @route POST /expenses
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const createMonthlyExpense = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
       /*
      // const { installment, monthlyExpenses, creditCardId } =
      //   req.body;
      const installment: NewMonthlyInstallment = req.body.installment;
      let buyExpense: Expense;
      let isNewExpense = false;
      try {
        buyExpense: Expense = await getExpenseById(installment.expenseId);
      } catch (error) {
        console.log("Buy expense was not found, creating a new one.");
        isNewExpense = true;
      }
      if (isNewExpense) {
      }
      // Create a new instance of Expense

     
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
      */
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

const buildFilter = (query: QueryString.ParsedQs): MontlyInstallmentFilter => {
  const { creditCard, archived } = query;
  let isArchived: number | undefined = undefined;
  if (archived !== undefined) {
    isArchived = ["1", "0"].includes(archived.toString())
      ? +archived.toString()
      : undefined;
  }

  const filter: MontlyInstallmentFilter = {
    creditcardId:
      creditCard
        ?.toString()
        .split(",")
        .map((id) => +id) || undefined,
    archived: isArchived,
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
