import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { ExpenseGroup, ExpenseGroupDetail, Expense } from "../models/expenses";
import { getExpenseItemResponse } from "../utils/expenseUtils";

export const getExpenseGroups = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups = await AppDataSource.manager.find(ExpenseGroup, {
        order: { name: "ASC" },
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: groups }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting expense groups", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getExpenseGroupById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const group = await AppDataSource.manager.findOne(ExpenseGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Expense group not found", HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: group }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting expense group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const createExpenseGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, icon } = req.body;
      const group = new ExpenseGroup();
      group.name = name;
      group.description = description ?? null;
      group.icon = icon ?? null;
      const result = await AppDataSource.manager.save(group);
      res.status(HTTP_STATUS.CREATED).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error creating expense group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateExpenseGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const group = await AppDataSource.manager.findOne(ExpenseGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Expense group not found", HTTP_STATUS.NOT_FOUND));
      }
      const { name, description, icon } = req.body;
      group.name = name;
      group.description = description ?? null;
      group.icon = icon ?? null;
      const result = await AppDataSource.manager.save(group);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error updating expense group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const deleteExpenseGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const group = await AppDataSource.manager.findOne(ExpenseGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Expense group not found", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(ExpenseGroup, { id });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error deleting expense group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getExpensesByGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = +req.params.id;
      const group = await AppDataSource.manager.findOne(ExpenseGroup, { where: { id: groupId } });
      if (!group) {
        return next(new Exception("Expense group not found", HTTP_STATUS.NOT_FOUND));
      }
      const details = await AppDataSource.manager.find(ExpenseGroupDetail, { where: { groupId } });
      const expenseIds = details.map((d) => d.expenseId);
      if (expenseIds.length === 0) {
        return res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: [] }));
      }
      const expenses = await AppDataSource.manager.findByIds(Expense, expenseIds);
      const items = await Promise.all(expenses.map(getExpenseItemResponse));
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: items }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error getting expenses for group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const addExpenseToGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = +req.params.id;
      const { expenseId } = req.body;
      const group = await AppDataSource.manager.findOne(ExpenseGroup, { where: { id: groupId } });
      if (!group) {
        return next(new Exception("Expense group not found", HTTP_STATUS.NOT_FOUND));
      }
      const expense = await AppDataSource.manager.findOne(Expense, { where: { id: expenseId } });
      if (!expense) {
        return next(new Exception("Expense not found", HTTP_STATUS.NOT_FOUND));
      }
      const existing = await AppDataSource.manager.findOne(ExpenseGroupDetail, {
        where: { groupId, expenseId },
      });
      if (existing) {
        return next(new Exception("Expense already in group", HTTP_STATUS.CONFLICT));
      }
      const detail = new ExpenseGroupDetail();
      detail.groupId = groupId;
      detail.expenseId = expenseId;
      const result = await AppDataSource.manager.save(detail);
      res.status(HTTP_STATUS.CREATED).json(new HttpResponse({ data: result }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error adding expense to group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const removeExpenseFromGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = +req.params.id;
      const expenseId = +req.params.expenseId;
      const detail = await AppDataSource.manager.findOne(ExpenseGroupDetail, {
        where: { groupId, expenseId },
      });
      if (!detail) {
        return next(new Exception("Expense not found in group", HTTP_STATUS.NOT_FOUND));
      }
      await AppDataSource.manager.delete(ExpenseGroupDetail, { id: detail.id });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { groupId, expenseId } }));
    } catch (error) {
      console.error(error);
      return next(new Exception("Error removing expense from group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);
