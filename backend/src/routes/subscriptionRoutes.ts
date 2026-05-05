import { Router } from "express";
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getPaymentHistory,
  addPayments,
  removePayment,
  searchExpenses,
  getSubscriptionSummary,
} from "../controllers/subscriptionController";

const router = Router();

// Summary and search must be declared before /:id to avoid route conflicts
router.route("/summary").get(getSubscriptionSummary);
router.route("/search-expenses").get(searchExpenses);

// Subscription CRUD
router.route("/").get(getSubscriptions).post(createSubscription);
router.route("/:id").get(getSubscriptionById).put(updateSubscription).delete(deleteSubscription);

// Payment history
router.route("/:id/payments").get(getPaymentHistory).post(addPayments);
router.route("/:id/payments/:paymentId").delete(removePayment);

export default router;
