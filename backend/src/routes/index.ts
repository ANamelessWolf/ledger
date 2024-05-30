import { Router } from "express";
import cors from "cors";

import { errorHandler, unhandledRoutesHandler } from "../middlewares";
import swaggerMiddleware from "../middlewares/swaggerMiddleware";

const router = Router();

router.use(cors({ origin: "*" }));

// API Routes
/**
 * Add here the routes handlers
 * **/
router.use("/api-docs", swaggerMiddleware);

// Routes error handlers
router.all("*", unhandledRoutesHandler);
router.use(errorHandler);

export default router;
