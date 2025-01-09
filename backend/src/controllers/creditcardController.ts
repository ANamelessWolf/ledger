import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import {
  CreditCardSpendingReport,
  Creditcard,
  CreditcardPayment,
  Wallet,
  WalletGroup,
} from "../models/ledger";
import { AppDataSource } from "..";
import {
  filterCard,
  generateCreditCardPeriods,
  getCreditCardStatus,
  getInstallments,
  groupSpending,
} from "../utils/creditCardUtils";
import { FinancingEntity } from "../models/banking";
import { formatMoney } from "../utils/formatUtils";
import { CreditCardSummary } from "../types/response/creditCardSummaryResponse";
import { MoreThan } from "typeorm";
import { CardSpendingResponse } from "../types/response/cardSpendingResponse";
import { CardSpending } from "../types/cardSpending";
import { CreditCardPeriodResponse } from "../types/paymentStatus";
import { getPeriodKey } from "../utils/dateUtils";
import { findCreditCardPeriod } from "../utils/creditCardPeriodUtils";

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
        const wallet: Wallet | null = await cc.preferredWallet;
        const payments = await cc.payments;
        const status = getCreditCardStatus(today, payments, cc.cutDay);
        // const status2 = getCreditCardStatus2(today, payments, cc.cutDay);
        // console.log(status);
        const banking: FinancingEntity | null = await cc.financingEntity;
        if (
          wallet !== null &&
          banking !== null &&
          filterCard(value, wallet, banking)
        ) {
          result.push({
            id: cc.id,
            preferredWalletId: cc.preferredWalletId,
            walletGroupId: cc.walletGroupId,
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
            type: cc.cardType,
            cutday: cc.cutDay,
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
      const status = getCreditCardStatus(
        today,
        payments,
        cc.cutDay,
        cc.daysToPay
      );
      const wallet: Wallet | null = await cc.preferredWallet;
      const banking: FinancingEntity | null = await cc.financingEntity;
      if (wallet === null || banking === null) {
        return next(
          new Exception(`Invalid wallet or banking`, HTTP_STATUS.BAD_REQUEST)
        );
      }

      const installment = await getInstallments(cc.id);
      const result: CreditCardSummary = {
        id: cc.id,
        preferredWalletId: cc.preferredWalletId,
        walletGroupId: cc.walletGroupId,
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
        type: cc.cardType,
        cutday: cc.cutDay,
        installment: installment,
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
 * Retrieves a credit card spending history by Id
 * @summary The last 12 credit card spending history
 * @operationId getCreditcardSpendingHistoryById
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getCreditcardSpendingHistoryById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Last 12 payments
      const today = new Date();
      const startDate = new Date(today.getTime());
      startDate.setDate(1);
      startDate.setMonth(today.getMonth() - 12);

      const id: number = +req.params.id;
      const where: any = {
        id: id,
        paymentDate: MoreThan(startDate),
      };

      // Gets the creditcard information
      const creditcard: Creditcard | null = await AppDataSource.manager.findOne(
        Creditcard,
        {
          where: { id: id },
        }
      );
      if (creditcard === null) {
        throw new Exception("Invalid Creditcard id", HTTP_STATUS.BAD_REQUEST);
      }

      // Gets the payment information
      let payment = null;
      const payments: CreditCardSpendingReport[] =
        await AppDataSource.manager.find(CreditCardSpendingReport, {
          where,
        });
      let cutDay;
      if (payments.length === 0) {
        cutDay = creditcard.cutDay;
      } else {
        payment = payments[0];
        cutDay = payment.cutDay;
      }

      // Gets the credit card periods
      const current = generateCreditCardPeriods(cutDay, today.getFullYear());
      const previous = generateCreditCardPeriods(
        cutDay,
        today.getFullYear() - 1
      );

      const periods = [...current, ...previous];
      let result: CardSpendingResponse;
      if (payment !== null) {
        const spendingHistory: CardSpending[] = payments
          .map((p: CreditCardSpendingReport) => {
            const period = findCreditCardPeriod(periods, p.paymentDate);
            if (period !== undefined) {
              return {
                label: period.period.key,
                spending: p.payment,
                period: getPeriodKey(period.cutDate.dateValue),
                cutDate: period.cutDate.dateValue,
              };
            } else {
              return undefined;
            }
          })
          .filter((x) => x !== undefined);
        const data = groupSpending(spendingHistory);
        const values = data.map((p) => p.spending);
        const payment_avg: number =
          values.reduce((pV, cV) => pV + cV) / values.length;
        result = {
          id: id,
          entityId: payment.id,
          name: payment.name,
          banking: payment.entity,
          ending: payment.ending,
          active: payment.active,
          average: formatMoney(payment_avg),
          max: formatMoney(Math.max(...values)),
          min: formatMoney(Math.min(...values)),
          spending: data,
        };
      } else {
        const banking: FinancingEntity | null =
          await creditcard.financingEntity;
        const wallet: WalletGroup | null = await creditcard.walletGroup;
        result = {
          id: id,
          entityId: banking?.id || 0,
          name: wallet?.name || "",
          banking: banking?.name || "",
          ending: creditcard.ending,
          active: creditcard.active,
          average: formatMoney(0),
          max: formatMoney(0),
          min: formatMoney(0),
          spending: [],
        };
      }
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
          `An error occurred getting the credit card payment history`,
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
 * @summary Handles updates to a credit card
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
        daysToPay,
        ending,
        expiration,
        usedCredit,
      } = req.body;

      // Update data
      creditcard.active = active;
      creditcard.color = color;
      creditcard.credit = credit;
      creditcard.cutDay = cutDay;
      creditcard.daysToPay = daysToPay;
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

/**
 * Retrieves the current credit card periods
 * @summary Retrieves the credit card periods.
 * @operationId getCreditCardPeriods
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} The Promise that resolves when the operation is complete.
 */
export const getCreditCardPeriods = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cards: Creditcard[] = await AppDataSource.manager.find(Creditcard);
      const year: number = +req.params.year;
      const data: CreditCardPeriodResponse[] = [];
      cards.forEach((card: Creditcard) => {
        data.push({
          id: card.id,
          periods: generateCreditCardPeriods(card.cutDay, year),
        });
      });
      // Ok Response
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data,
        })
      );
    } catch (error) {
      return next(
        new Exception(
          `An error ocurred getting the card periods`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);
