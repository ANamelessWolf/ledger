import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { Creditcard, Wallet } from "../models/ledger";
import { AppDataSource } from "..";
import { filterCard, getCreditCardStatus } from "../utils/creditCardUtils";
import { FinancingEntity } from "../models/banking";
import { formatMoney } from "../utils/formatUtils";
import { CreditCardSummary } from "../types/response/CreditCardSummaryResponse";

/**
 * Retrieves a summary of credit cards, including their current status and details.
 * @summary Retrieves a summary of credit cards.
 * @operationId getCreditcardSummary
 * @async
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
            usedCredit: formatMoney(cc.usedCredit),
            status: status,
            expiration: cc.expiration,
            cardType: cc.cardType,
            ending: cc.ending,
            color: cc.color,
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


