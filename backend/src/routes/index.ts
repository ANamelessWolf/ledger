import { Router } from "express";
import cors from "cors";

import { errorHandler, unhandledRoutesHandler } from "../middlewares";
import swaggerMiddleware from "../middlewares/swaggerMiddleware";
import creditcardRoutes from './creditcardRoutes';

const router = Router();

router.use(cors({ origin: "*" }));

// API Routes
/**
 * Add here the routes handlers
 * **/
router.use("/api-docs", swaggerMiddleware);
router.use('/creditcard', creditcardRoutes);

// Routes error handlers
router.all("*", unhandledRoutesHandler);
router.use(errorHandler);

export default router;
