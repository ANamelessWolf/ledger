import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { CardItem } from "../models/catalogs";
import { getCardListFilter } from "../utils/creditCardUtils";

/**
 * Retrieves a list of cards, including debit or credit cards.
 * @summary Retrieves list of cards.
 * @operationId getCardList
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getCardList = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entityId, isCreditCard, active } = req.query;
      const where = getCardListFilter(entityId, isCreditCard, active);
      const cards: CardItem[] = await AppDataSource.manager.find(CardItem, {
        where,
      });

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: cards,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error occurred getting the credit card summary`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);
