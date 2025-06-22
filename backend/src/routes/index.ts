import { Router, json } from "express";
import cors from "cors";

import { errorHandler, unhandledRoutesHandler } from "../middlewares";
import swaggerMiddleware from "../middlewares/swaggerMiddleware";
import creditcardRoutes from './creditcardRoutes';
import debitcardRoutes from './debitcardRoutes';
import catalogRoutes from './catalogRoutes';
import expenseRoutes from './expenseRoutes';
import walletRoutes from './walletRoutes';
import monthlyRoute from './monthlyRoute';

const router = Router();

router.use(cors({ origin: "*" }));
router.use(json());
// API Routes
/**
 * Add here the routes handlers
 * **/
router.use("/api-docs", swaggerMiddleware);
router.use('/creditcard', creditcardRoutes);
router.use('/debitcard', debitcardRoutes);
router.use('/catalog', catalogRoutes);
router.use('/expenses', expenseRoutes);
router.use('/wallet', walletRoutes);
router.use('/monthly', monthlyRoute);

// Routes error handlers
router.all("*", unhandledRoutesHandler);
router.use(errorHandler);

export default router;
