import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { Debitcard, Wallet } from "../models/ledger";
import { AppDataSource } from "..";
import { filterCard } from "../utils/creditCardUtils";
import { FinancingEntity } from "../models/banking";
import { formatMoney, formatPercent } from "../utils/formatUtils";
import { DebitCardSummary } from "../types/response/DebitCardSummaryResponse";

/**
 * Retrieves a summary of debit cards, including their current status and details.
 * @summary Retrieves a summary of debit cards.
 * @operationId getDebitcardSummary
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getDebitcardSummary = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = req.query.value?.toString() || "";
      const cards: Debitcard[] = await AppDataSource.manager.find(Debitcard);
      const result: DebitCardSummary[] = [];
      for (let index = 0; index < cards.length; index++) {
        const dc: Debitcard = cards[index];
        const saving = (await dc.saving)[0];
        const wallet: Wallet = (await saving.wallet)[0];
        const banking: FinancingEntity = (await saving.financingEntity)[0];
        if (filterCard(value, wallet, banking)) {
          result.push({
            id: dc.id,
            walletId: saving.walletId,
            entityId: saving.entityId,
            card: wallet.name,
            banking: banking.name,
            investmentRate: formatPercent(saving.interestRate),
            yearlyGain: formatPercent(
              (saving.interestRate / 100) * saving.total
            ),
            total: formatMoney(saving.total),
            expiration: dc.expiration,
            type: dc.cardType,
            ending: dc.ending,
            color: dc.color,
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
 * Retrieve debit card summary, including their current status and details.
 * @summary Retrieve debit card summary.
 * @operationId getDebitcardSummarybyId
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getDebitcardSummarybyId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: number = +req.params.id;
      const where: any = { id: id };
      const cards: Debitcard[] = await AppDataSource.manager.find(Debitcard, {
        where,
      });

      // Validate id
      if (cards.length === 0) {
        return next(new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST));
      }

      // Get summary
      const dc: Debitcard = cards[0];
      const saving = (await dc.saving)[0];
      const wallet: Wallet = (await saving.wallet)[0];
      const banking: FinancingEntity = (await saving.financingEntity)[0];
      const result = {
        id: dc.id,
        walletId: saving.walletId,
        entityId: saving.entityId,
        card: wallet.name,
        banking: banking.name,
        investmentRate: formatPercent(saving.interestRate),
        yearlyGain: formatMoney(
          (saving.interestRate / 100) * saving.total
        ),
        total: formatMoney(saving.total),
        expiration: dc.expiration,
        type: dc.cardType,
        ending: dc.ending,
        color: dc.color,
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
