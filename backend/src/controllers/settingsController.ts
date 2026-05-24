import { Request, Response, NextFunction } from 'express';
import { Exception, HTTP_STATUS, HttpResponse } from '../common';
import { asyncErrorHandler } from '../middlewares';
import { AppDataSource } from '..';
import { ExpenseType, FinancingType, Vendor, WalletType } from '../models/catalogs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeHandlers = <T extends { id: number }>(
  entity: new () => T,
  label: string,
  mapFields: (body: any, item: T) => void
) => ({
  getAll: asyncErrorHandler(async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await AppDataSource.manager.find(entity, { order: { description: 'ASC' } as any });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: items }));
    } catch (err) {
      console.error(`[settings.getAll:${label}]`, err);
      return next(new Exception(`Error fetching ${label}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }),

  create: asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = new entity();
      mapFields(req.body, item);
      const saved = await AppDataSource.manager.save(item);
      res.status(HTTP_STATUS.CREATED).json(new HttpResponse({ data: saved }));
    } catch (err) {
      console.error(`[settings.create:${label}]`, err);
      return next(new Exception(`Error creating ${label}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }),

  update: asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await AppDataSource.manager.findOne(entity, { where: { id } as any });
      if (!item) return next(new Exception(`${label} not found`, HTTP_STATUS.NOT_FOUND));
      mapFields(req.body, item);
      const saved = await AppDataSource.manager.save(item);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: saved }));
    } catch (err) {
      console.error(`[settings.update:${label}]`, err);
      return next(new Exception(`Error updating ${label}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }),

  remove: asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await AppDataSource.manager.findOne(entity, { where: { id } as any });
      if (!item) return next(new Exception(`${label} not found`, HTTP_STATUS.NOT_FOUND));
      await AppDataSource.manager.remove(item);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err: any) {
      console.error(`[settings.delete:${label}]`, err);
      if (err?.code === 'ER_ROW_IS_REFERENCED_2' || err?.errno === 1451) {
        return next(new Exception(`Cannot delete: ${label} is in use`, HTTP_STATUS.CONFLICT));
      }
      return next(new Exception(`Error deleting ${label}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }),
});

// ─── Expense Types ────────────────────────────────────────────────────────────

const expenseTypeHandlers = makeHandlers(
  ExpenseType,
  'ExpenseType',
  (body, item) => {
    item.description = body.description;
    item.icon = body.icon ?? item.icon;
  }
);
export const getExpenseTypes  = expenseTypeHandlers.getAll;
export const createExpenseType = expenseTypeHandlers.create;
export const updateExpenseType = expenseTypeHandlers.update;
export const deleteExpenseType = expenseTypeHandlers.remove;

// ─── Financing Types ──────────────────────────────────────────────────────────

const financingTypeHandlers = makeHandlers(
  FinancingType,
  'FinancingType',
  (body, item) => { item.description = body.description; }
);
export const getFinancingTypes   = financingTypeHandlers.getAll;
export const createFinancingType = financingTypeHandlers.create;
export const updateFinancingType = financingTypeHandlers.update;
export const deleteFinancingType = financingTypeHandlers.remove;

// ─── Vendors ──────────────────────────────────────────────────────────────────

const vendorHandlers = makeHandlers(
  Vendor,
  'Vendor',
  (body, item) => { item.description = body.description; }
);
export const getVendors   = vendorHandlers.getAll;
export const createVendor = vendorHandlers.create;
export const updateVendor = vendorHandlers.update;
export const deleteVendor = vendorHandlers.remove;

// ─── Wallet Types ─────────────────────────────────────────────────────────────

const walletTypeHandlers = makeHandlers(
  WalletType,
  'WalletType',
  (body, item) => { item.description = body.description; }
);
export const getWalletTypes   = walletTypeHandlers.getAll;
export const createWalletType = walletTypeHandlers.create;
export const updateWalletType = walletTypeHandlers.update;
export const deleteWalletType = walletTypeHandlers.remove;
