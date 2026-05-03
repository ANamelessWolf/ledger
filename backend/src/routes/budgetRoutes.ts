import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  addBudgetItem,
  getBudgetById,
  getBudgetItemsByBudgetId,
  getBudgetsByOwnerId,
  getMonthSummaryByOwnerId,
  getWeekSummaryByOwnerId,
  getYearSummaryByOwnerId,
  removeBudgetItem,
  updateBudget,
} from "../controllers/budgetController";

const router = Router();

// Summary endpoints (must come before /:id to avoid route conflicts)
router.route("/summary/week").get(getWeekSummaryByOwnerId);
router.route("/summary/month").get(getMonthSummaryByOwnerId);
router.route("/summary/year").get(getYearSummaryByOwnerId);

// Budget CRUD
router.route("/").get(getBudgetsByOwnerId).post(createBudget);
router.route("/:id").get(getBudgetById).put(updateBudget).delete(deleteBudget);

// Budget items
router
  .route("/:id/items")
  .get(getBudgetItemsByBudgetId)
  .post(addBudgetItem);
router.route("/:id/items/:itemId").delete(removeBudgetItem);

export default router;
