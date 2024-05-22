import { NextFunction, Request, Response } from 'express';

import { Exception } from '../common';

/**
 * Middleware that handles unknown routes and sends back
 * an error response with HTTP status 404.
 */
export const unhandledRoutesHandler = (req: Request, res: Response, next: NextFunction) => {
	next(new Exception(
		`Route ${req.originalUrl} does not exist`,
		404,
	));
};
