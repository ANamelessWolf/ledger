import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { MobileSyncService } from "../services/mobileSync/MobileSyncService";
import { TypeOrmMobileSyncStore } from "../services/mobileSync/TypeOrmMobileSyncStore";

/** Lazily created so the data source is only touched once a request arrives. */
let service: MobileSyncService | null = null;
const getService = (): MobileSyncService => {
  if (service === null) {
    service = new MobileSyncService(new TypeOrmMobileSyncStore(AppDataSource));
  }
  return service;
};

/**
 * Idempotent batch upload of expenses created in the mobile app.
 * @summary Inserts up to 10 expenses identified by stable `syncKey` values.
 * @route POST /expenses/sync
 * @param {Request} req - Body `{ expenses: MobileExpenseSyncItem[] }`.
 * @param {Response} res - `{ data: MobileExpenseSyncResult[], success }`; HTTP 200 whenever
 *   the batch was processed, even if some items failed (see each item's `success`).
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const syncMobileExpenses = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await getService().syncExpenses(req.body);
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: results,
          success: results.every((r) => r.success),
        })
      );
    } catch (error) {
      if (error instanceof Exception) return next(error);
      console.error("[syncMobileExpenses]", error);
      return next(
        new Exception("An error occurred synchronizing expenses", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);
