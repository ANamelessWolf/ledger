import { Router, json } from 'express';
import cors from 'cors';

import {
    errorHandler,
	unhandledRoutesHandler,
} from '../middlewares';

const router = Router();

router.use(cors({ origin: '*' }));

// API Routes
/** 
 * Add here the routes handlers
 * **/

// Routes error handlers
router.all('*', unhandledRoutesHandler);
router.use(errorHandler);

export default router;
