import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { Creditcard, CreditcardPayment, Wallet } from "../models/ledger";
import { AppDataSource } from "..";
import { filterCard, getCreditCardStatus } from "../utils/creditCardUtils";
import { FinancingEntity } from "../models/banking";
import { formatMoney } from "../utils/formatUtils";
import { CreditCardSummary } from "../types/response/CreditCardSummaryResponse";

/**
 * Retrieves a summary of credit cards, including their current status and details.
 * @summary Retrieves a summary of credit cards.
 * @operationId getCreditcardSummary
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getCreditcardSummary = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = req.query.value?.toString() || "";
      const cards: Creditcard[] = await AppDataSource.manager.find(Creditcard);
      const today = new Date();
      const result: CreditCardSummary[] = [];
      for (let index = 0; index < cards.length; index++) {
        const cc: Creditcard = cards[index];
        const payments = await cc.payments;
        const status = getCreditCardStatus(today, payments, cc.cutDay);
        const wallet: Wallet = (await cc.wallet)[0];
        const banking: FinancingEntity = (await cc.financingEntity)[0];
        if (filterCard(value, wallet, banking)) {
          result.push({
            id: cc.id,
            walletId: cc.walletId,
            entityId: cc.entityId,
            card: wallet.name,
            banking: banking.name,
            credit: formatMoney(cc.credit),
            available: formatMoney(cc.credit - cc.usedCredit),
            usedCredit: formatMoney(cc.usedCredit),
            status: status,
            expiration: cc.expiration,
            cardType: cc.cardType,
            ending: cc.ending,
            color: cc.color,
            type: cc.cardType
          });
        }
      }

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
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
 * Retrieve credit card summary, including their current status and details.
 * @summary Retrieve credit card summary.
 * @operationId getCreditcardSummarybyId
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getCreditcardSummarybyId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const where: any = { id: id };
      const cards: Creditcard[] = await AppDataSource.manager.find(Creditcard, {
        where,
      });

      // Validate id
      if (cards.length === 0) {
        return next(new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST));
      }

      // Get summary
      const today = new Date();
      const cc: Creditcard = cards[0];
      const payments = await cc.payments;
      const status = getCreditCardStatus(today, payments, cc.cutDay);
      const wallet: Wallet = (await cc.wallet)[0];
      const banking: FinancingEntity = (await cc.financingEntity)[0];
      const result:CreditCardSummary = {
        id: cc.id,
        walletId: cc.walletId,
        entityId: cc.entityId,
        card: wallet.name,
        banking: banking.name,
        credit: formatMoney(cc.credit),
        available: formatMoney(cc.credit - cc.usedCredit),
        usedCredit: formatMoney(cc.usedCredit),
        status: status,
        expiration: cc.expiration,
        cardType: cc.cardType,
        ending: cc.ending,
        color: cc.color,
        type: cc.cardType
      };

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
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
 * Submit a new payment to a credit card
 * @summary Handles adding a new payment to a credit card
 * @route PUT /payCreditcard/:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const addCreditcardPayment = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const { total, payDate, cutDate, dueDate } = req.body;
      // Create a new instance of CreditcardPayment
      const payment = new CreditcardPayment();
      payment.creditcardId = id;
      payment.paymentTotal = total;
      payment.paymentDate = payDate;
      payment.paymentCutDate = cutDate;
      payment.paymentDueDate = dueDate;

      // Save the insert record
      const result = await AppDataSource.manager.save(payment);

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
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
 * Updates a credit card
 * @summary Handles adding a new payment to a credit card
 * @route POST /:id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void>} - The response with the payment details or an error
 */
export const updateCreditcard = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const where: any = { id: id };
      const cards: Creditcard[] = await AppDataSource.manager.find(Creditcard, {
        where,
      });

      // Validate id
      if (cards.length === 0) {
        return next(new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST));
      }

      // Get the current Creditcard
      const creditcard: Creditcard = cards[0];
      const {
        active,
        color,
        credit,
        cutDay,
        dueDay,
        ending,
        expiration,
        usedCredit,
      } = req.body;

      // Update data
      creditcard.active = active;
      creditcard.color = color;
      creditcard.credit = credit;
      creditcard.cutDay = cutDay;
      creditcard.dueDay = dueDay;
      creditcard.ending = ending;
      creditcard.expiration = expiration;
      creditcard.usedCredit = usedCredit;

      // Save the record
      const result = await AppDataSource.manager.save(creditcard);

      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
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
