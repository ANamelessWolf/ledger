import { Router } from "express";
import {
  createExpenseGroup,
  deleteExpenseGroup,
  getExpenseGroupById,
  getExpenseGroups,
  getExpensesByGroup,
  addExpenseToGroup,
  removeExpenseFromGroup,
  updateExpenseGroup,
} from "../controllers/expenseGroupController";

const router = Router();

// Group CRUD
router.route("/").get(getExpenseGroups).post(createExpenseGroup);
router.route("/:id").get(getExpenseGroupById).put(updateExpenseGroup).delete(deleteExpenseGroup);

// Expenses within a group
router.route("/:id/expenses").get(getExpensesByGroup).post(addExpenseToGroup);
router.route("/:id/expenses/:expenseId").delete(removeExpenseFromGroup);

export default router;
