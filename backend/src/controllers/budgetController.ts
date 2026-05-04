import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { Budget } from "../models/budget/Budget";
import { BudgetItemDetail } from "../models/budget/BudgetItemDetail";

export const getBudgetsByOwnerId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = +(req.query.ownerId ?? 1);
      const budgets = await AppDataSource.manager.find(Budget, {
        where: { ownerId },
        order: { description: "ASC" },
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: budgets }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting budgets", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getBudgetById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const budget = await AppDataSource.manager.findOne(Budget, { where: { id } });
      if (!budget) {
        return next(new Exception("Budget not found", HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: budget }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting budget", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const createBudget = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ownerId, currencyId, description, icon, total, startDate, endDate, annualBudget } = req.body;
      const budget = new Budget();
      budget.ownerId = ownerId ?? 1;
      budget.currencyId = currencyId;
      budget.description = description;
      budget.icon = icon ?? null;
      budget.total = total;
      budget.startDate = startDate ?? null;
      budget.endDate = endDate ?? null;
      budget.annualBudget = annualBudget ? 1 : 0;
      const result = await AppDataSource.manager.save(budget);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error creating budget", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateBudget = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const budget = await AppDataSource.manager.findOne(Budget, { where: { id } });
      if (!budget) {
        return next(new Exception("Budget not found", HTTP_STATUS.NOT_FOUND));
      }
      const { currencyId, description, icon, total, startDate, endDate, annualBudget } = req.body;
      budget.currencyId = currencyId;
      budget.description = description;
      budget.icon = icon ?? null;
      budget.total = total;
      budget.startDate = startDate ?? null;
      budget.endDate = endDate ?? null;
      budget.annualBudget = annualBudget ? 1 : 0;
      const result = await AppDataSource.manager.save(budget);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error updating budget", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const deleteBudget = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const budget = await AppDataSource.manager.findOne(Budget, { where: { id } });
      if (!budget) {
        return next(new Exception("Budget not found", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(BudgetItemDetail, { budgetId: id });
      await AppDataSource.manager.delete(Budget, { id });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error deleting budget", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getBudgetItemsByBudgetId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetId = +req.params.id;
      const items = await AppDataSource.manager.find(BudgetItemDetail, {
        where: { budgetId },
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: items }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting budget items", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const addBudgetItem = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetId = +req.params.id;
      const { itemType, itemId } = req.body;
      const item = new BudgetItemDetail();
      item.budgetId = budgetId;
      item.itemType = itemType;
      item.itemId = itemId;
      const result = await AppDataSource.manager.save(item);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error adding budget item", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const removeBudgetItem = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = +req.params.itemId;
      const item = await AppDataSource.manager.findOne(BudgetItemDetail, { where: { id: itemId } });
      if (!item) {
        return next(new Exception("Budget item not found", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(BudgetItemDetail, { id: itemId });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: itemId } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error removing budget item", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getWeekSummaryByOwnerId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = +(req.query.ownerId ?? 1);
      let monday: Date, sunday: Date, start: string, end: string;
      if (req.query.start && req.query.end) {
        start = req.query.start.toString();
        end = req.query.end.toString();
        monday = parseSqlDate(start);
        sunday = parseSqlDate(end);
      } else {
        ({ monday, sunday, start, end } = getWeekRange());
      }
      const raw = await callGetBudgetSummary(ownerId, start, end, 0);
      const result = raw.map((row: any) => {
        const weeklyBudget = round2(calcWeeklyBudget(row.budgetTotal, monday, sunday));
        return { ...row, budgetTotal: weeklyBudget, remaining: round2(weeklyBudget - row.spentTotal) };
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting week summary", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getMonthSummaryByOwnerId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = +(req.query.ownerId ?? 1);
      const { start, end } = req.query.start && req.query.end
        ? { start: req.query.start.toString(), end: req.query.end.toString() }
        : getMonthRange();
      const result = await callGetBudgetSummary(ownerId, start, end, 0);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting month summary", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getYearSummaryByOwnerId = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = +(req.query.ownerId ?? 1);
      const { start, end } = req.query.start && req.query.end
        ? { start: req.query.start.toString(), end: req.query.end.toString() }
        : getYearRange();
      const raw = await callGetBudgetSummary(ownerId, start, end, 1);
      const result = raw.map((row: any) => {
        return { ...row, remaining: round2(row.budgetTotal - row.spentTotal) };
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting year summary", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

const callGetBudgetSummary = async (ownerId: number, start: string, end: string, annualBudget: 0 | 1) => {
  const rawResult: any = await AppDataSource.query(
    "CALL GetBudgetSummary(?, ?, ?, ?);",
    [ownerId, start, end, annualBudget]
  );
  const rows: any[] = rawResult[0] ?? rawResult;
  return rows.map((row) => ({
    budgetId: row.budget_id,
    description: row.description,
    icon: row.icon,
    budgetTotal: row.budget_total,
    spentTotal: row.spent_total,
    remaining: row.remaining,
  }));
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

const parseSqlDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toSqlDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Splits a week across the months it spans and calculates the proportional
 * budget for that week.
 * For each day in the week: contribution = monthlyBudget / daysInThatMonth.
 * Sums all daily contributions.
 */
const calcWeeklyBudget = (monthlyBudget: number, weekStart: Date, weekEnd: Date): number => {
  let total = 0;
  const cursor = new Date(weekStart);
  while (cursor <= weekEnd) {
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    total += monthlyBudget / daysInMonth;
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
};

const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday, start: toSqlDate(monday), end: toSqlDate(sunday) };
};

const getMonthRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: toSqlDate(start), end: toSqlDate(end) };
};

const getYearRange = () => {
  const year = new Date().getFullYear();
  return { start: `${year}-01-01`, end: `${year}-12-31` };
};
