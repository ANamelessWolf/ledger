import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { CardItem, ExpenseType, Vendor } from "../models/catalogs";
import {
  getCardListFilter,
  getCreditCardStatus,
  getPayments,
} from "../utils/creditCardUtils";
import { FinancingEntity } from "../models/banking";
import { CatalogItem } from "../types/response/catalogItemResponse";
import { Creditcard, Wallet } from "../models/ledger";
import { PAYMENT_STATUS } from "../common/enums";
import { CardItemResponse } from "../types/response/cardItemResponse";

const NAME_FILTER: any = {
  order: {
    name: {
      name: "ASC",
    },
  },
};

const DESC_FILTER: any = {
  order: {
    description: {
      name: "ASC",
    },
  },
};

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
      const today = new Date();
      const cc_cards: Creditcard[] = await AppDataSource.manager.find(
        Creditcard
      );
      const cards: CardItem[] = await AppDataSource.manager.find(CardItem, {
        where,
      });
      const response: CardItemResponse[] = [];
      const cancelled: CardItemResponse[] = [];
      for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const cc = getCreditCard(card, cc_cards);
        let status: string = PAYMENT_STATUS.UNDEFINED;
        if (cc !== null) {
          const payments = await getPayments(card.id);
          if (cc.active === 2) {
            status = PAYMENT_STATUS.NOT_REQUIRED;
          } else {
            status = getCreditCardStatus(today, payments, cc.cutDay).status;
          }
        }
        if (card.active === 2) {
          cancelled.push({
            ...card,
            status: status,
          });
        } else {
          response.push({
            ...card,
            status: status,
          });
        }
      }
      cancelled.forEach((card) => response.push(card));

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: response,
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

/**
 * Retrieves a list of financing, entities
 * @summary Retrieves all financing entities.
 * @operationId getFinancingEnityList
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getFinancingEnityList = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sort = NAME_FILTER;
      const entities: FinancingEntity[] = await AppDataSource.manager.find(
        FinancingEntity,
        sort
      );
      let result: CatalogItem[] = [];
      if (entities)
        result = entities.map((fe: FinancingEntity) => {
          const catItem: CatalogItem = { id: fe.id, name: fe.name };
          return catItem;
        });
      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error occurred getting the financing entity list`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Retrieves a list of wallets
 * @summary Retrieves all wallets.
 * @operationId getWalletList
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getWalletList = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sort = NAME_FILTER;
      const wallets: Wallet[] = await AppDataSource.manager.find(Wallet, sort);
      let result: CatalogItem[] = [];
      if (wallets)
        result = wallets.map((wa: Wallet) => {
          const catItem: CatalogItem = { id: wa.id, name: wa.name };
          return catItem;
        });

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error occurred getting the wallet list`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Retrieves a list of expense types
 * @summary Retrieves all expenses types.
 * @operationId getExpensesTypesList
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getExpensesTypesList = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sort = DESC_FILTER;
      const eTypes: ExpenseType[] = await AppDataSource.manager.find(
        ExpenseType,
        sort
      );
      let result: CatalogItem[] = [];
      if (eTypes)
        result = eTypes.map((ex: ExpenseType) => {
          const catItem: CatalogItem = { id: ex.id, name: ex.description };
          return catItem;
        });

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error occurred getting the expense type list`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

/**
 * Retrieves a list of vendors types
 * @summary Retrieves all expenses types.
 * @operationId getVendorList
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getVendorList = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sort = DESC_FILTER;
      const vendors: Vendor[] = await AppDataSource.manager.find(Vendor, sort);
      let result: CatalogItem[] = [];
      if (vendors)
        result = vendors.map((v: Vendor) => {
          const catItem: CatalogItem = { id: v.id, name: v.description };
          return catItem;
        });

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error occurred getting the vendor list`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

const getCreditCard = (
  card: CardItem,
  cc_cards: Creditcard[]
): Creditcard | null => {
  if (card.isCreditCard) {
    const result: Creditcard[] = cc_cards.filter((x) => x.id === card.id);
    if (result.length > 0) {
      return result[0];
    }
  }
  return null;
};
