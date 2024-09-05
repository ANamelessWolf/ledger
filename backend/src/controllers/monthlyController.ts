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
import { MonthlyNonInterest } from "../models/banking";
import { MontlyInstallmentFilter } from "../types/filter/montlyInstallmentFilter";
import {
  getMonthlyFilter,
  getMonthlyInstallmentItemResponse,
  getMonthlyInstallmentTotals,
} from "../utils/monthlyInstallmentUtils";
import {
  MonthlyInstallmentResponse,
} from "../types/response/monthlyInstallmentResponse";
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

      const totals = await getMonthlyInstallmentTotals(11,2023, filter);

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
