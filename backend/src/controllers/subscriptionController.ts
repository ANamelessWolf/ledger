import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { Subscription } from "../models/subscriptions/subscription";
import { SubscriptionPaymentHistory } from "../models/subscriptions/subcriptionPaymentHistory";

export const getSubscriptions = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await AppDataSource.query(`
        SELECT s.id, s.name, s.price, s.active, s.charge_day AS chargeDay, s.last_payment_date AS lastPaymentDate,
          s.wallet_id AS walletId, s.currency_id AS currencyId, s.payment_frequency_id AS paymentFrequencyId,
          w.name AS wallet, c.name AS currency, c.symbol AS currencySymbol, pf.name AS paymentFrequency
        FROM subscription s
        JOIN wallet w ON w.id = s.wallet_id
        JOIN currency c ON c.id = s.currency_id
        JOIN payment_frequency pf ON pf.id = s.payment_frequency_id
        ORDER BY s.name ASC
      `);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: rows }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting subscriptions", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getSubscriptionById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const rows = await AppDataSource.query(`
        SELECT s.id, s.name, s.price, s.active, s.charge_day AS chargeDay, s.last_payment_date AS lastPaymentDate,
          s.wallet_id AS walletId, s.currency_id AS currencyId, s.payment_frequency_id AS paymentFrequencyId,
          w.name AS wallet, c.name AS currency, c.symbol AS currencySymbol, pf.name AS paymentFrequency
        FROM subscription s
        JOIN wallet w ON w.id = s.wallet_id
        JOIN currency c ON c.id = s.currency_id
        JOIN payment_frequency pf ON pf.id = s.payment_frequency_id
        WHERE s.id = ?
      `, [id]);
      if (!rows || rows.length === 0) {
        return next(new Exception("Subscription not found", HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: rows[0] }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const createSubscription = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId, currencyId, paymentFrequencyId, name, price, active, chargeDay, lastPaymentDate } = req.body;
      const sub = new Subscription();
      sub.walletId = +walletId;
      sub.currencyId = +currencyId;
      sub.paymentFrequencyId = +paymentFrequencyId;
      sub.name = name;
      sub.price = +price;
      sub.active = active !== undefined ? +active : 1;
      sub.chargeDay = +chargeDay;
      sub.lastPaymentDate = lastPaymentDate;
      const result = await AppDataSource.manager.save(sub);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error creating subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateSubscription = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const sub = await AppDataSource.manager.findOne(Subscription, { where: { id } });
      if (!sub) {
        return next(new Exception("Subscription not found", HTTP_STATUS.NOT_FOUND));
      }
      const { walletId, currencyId, paymentFrequencyId, name, price, active, chargeDay, lastPaymentDate } = req.body;
      sub.walletId = +walletId;
      sub.currencyId = +currencyId;
      sub.paymentFrequencyId = +paymentFrequencyId;
      sub.name = name;
      sub.price = +price;
      sub.active = active !== undefined ? +active : sub.active;
      sub.chargeDay = +chargeDay;
      sub.lastPaymentDate = lastPaymentDate;
      const result = await AppDataSource.manager.save(sub);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error updating subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const deleteSubscription = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const sub = await AppDataSource.manager.findOne(Subscription, { where: { id } });
      if (!sub) {
        return next(new Exception("Subscription not found", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(SubscriptionPaymentHistory, { subscriptionId: id });
      await AppDataSource.manager.delete(Subscription, { id });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error deleting subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getPaymentHistory = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriptionId = +req.params.id;
      const rows = await AppDataSource.query(`
        SELECT sph.id, sph.subscription_id AS subscriptionId, sph.expense_id AS expenseId,
          e.description, e.total, e.buy_date AS buyDate,
          w.name AS wallet, w.id AS walletId,
          et.description AS expenseType
        FROM subscription_payment_history sph
        JOIN expense e ON e.id = sph.expense_id
        JOIN wallet w ON w.id = e.wallet_id
        JOIN cat_expense_type et ON et.id = e.expense_type_id
        WHERE sph.subscription_id = ?
        ORDER BY e.buy_date DESC
      `, [subscriptionId]);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: rows }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting payment history", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const addPayments = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriptionId = +req.params.id;
      const { expenseIds } = req.body as { expenseIds: number[] };
      if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
        return next(new Exception("expenseIds array is required", HTTP_STATUS.BAD_REQUEST));
      }
      const entries: SubscriptionPaymentHistory[] = expenseIds.map((expenseId) => {
        const entry = new SubscriptionPaymentHistory();
        entry.subscriptionId = subscriptionId;
        entry.expenseId = +expenseId;
        return entry;
      });
      const result = await AppDataSource.manager.save(entries);

      // Update subscription with the most recent expense from the batch
      const placeholders = expenseIds.map(() => "?").join(",");
      const mostRecent = await AppDataSource.query(
        `SELECT total, buy_date AS lastPaymentDate FROM expense WHERE id IN (${placeholders}) ORDER BY buy_date DESC LIMIT 1`,
        expenseIds
      );
      if (mostRecent.length > 0) {
        await AppDataSource.manager.update(Subscription, subscriptionId, {
          price: mostRecent[0].total,
          lastPaymentDate: mostRecent[0].lastPaymentDate,
        });
      }

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error adding payments", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const removePayment = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentId = +req.params.paymentId;
      const entry = await AppDataSource.manager.findOne(SubscriptionPaymentHistory, { where: { id: paymentId } });
      if (!entry) {
        return next(new Exception("Payment record not found", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(SubscriptionPaymentHistory, { id: paymentId });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: paymentId } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error removing payment", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const searchExpenses = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const description = (req.query.description ?? "").toString().trim();
      if (!description) {
        res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: [] }));
        return;
      }
      const rows = await AppDataSource.query(`
        SELECT e.id, e.description, e.total, e.buy_date AS buyDate,
          w.name AS wallet, w.id AS walletId
        FROM expense e
        JOIN wallet w ON w.id = e.wallet_id
        WHERE e.description LIKE ?
        ORDER BY e.buy_date DESC
        LIMIT 50
      `, [`%${description}%`]);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: rows }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error searching expenses", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getSubscriptionSummary = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const month = +(req.query.month ?? now.getMonth() + 1);
      const year = +(req.query.year ?? now.getFullYear());

      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      const [monthlyRows, annualRows] = await Promise.all([
        AppDataSource.query(`
          SELECT COALESCE(SUM(e.total), 0) AS total
          FROM subscription_payment_history sph
          JOIN expense e ON e.id = sph.expense_id
          WHERE e.buy_date >= ? AND e.buy_date <= ?
        `, [monthStart, monthEnd]),
        AppDataSource.query(`
          SELECT COALESCE(SUM(e.total), 0) AS total
          FROM subscription_payment_history sph
          JOIN expense e ON e.id = sph.expense_id
          WHERE e.buy_date >= ? AND e.buy_date <= ?
        `, [yearStart, yearEnd]),
      ]);

      res.status(HTTP_STATUS.OK).json(new HttpResponse({
        data: {
          monthlyTotal: +(monthlyRows[0]?.total ?? 0),
          annualTotal: +(annualRows[0]?.total ?? 0),
          month,
          year,
        },
      }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting subscription summary", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);
