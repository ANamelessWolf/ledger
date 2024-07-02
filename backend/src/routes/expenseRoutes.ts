/**
 * @swagger
 * components:
 *   schemas:
 *     ExpenseItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         walletId:
 *           type: integer
 *           example: 12
 *         wallet:
 *           type: string
 *           example: "BBVA Nomina"
 *         expenseTypeId:
 *           type: integer
 *           example: 45
 *         expenseType:
 *           type: string
 *           example: "Prestamos"
 *         expenseIcon:
 *           type: string
 *           example: ""
 *         vendorId:
 *           type: integer
 *           example: 34
 *         vendor:
 *           type: string
 *           example: "NA"
 *         vendorIcon:
 *           type: string
 *           example: ""
 *         description:
 *           type: string
 *           example: "Préstamo por transferencia"
 *         total:
 *           type: string
 *           example: "MXN $10,000.00"
 *         value:
 *           type: number
 *           example: 10000
 *         buyDate:
 *           type: string
 *           example: "May 17, 2023"
 */
import { Router } from "express";
import { getExpenses } from "../controllers/expenseController";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Ledger expenses api
 * /expenses:
 *  get:
 *    summary: Get a list of expenses
 *    description: Retrieve a list of expenses filtered by various criteria.
 *    tags: [Expenses]
 *    parameters:
 *      - name: wallet
 *        in: query
 *        description: Comma-separated list of wallet IDs
 *        required: false
 *        schema:
 *          type: string
 *          example: "7,4"
 *      - name: expenseTypes
 *        in: query
 *        description: Comma-separated list of expense type IDs
 *        required: false
 *        schema:
 *          type: string
 *          example: "7,45"
 *      - name: vendors
 *        in: query
 *        description: Comma-separated list of vendor IDs
 *        required: false
 *        schema:
 *          type: string
 *          example: "8,36"
 *      - name: start
 *        in: query
 *        description: Start date for the expense period
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *          example: "2019-01-01"
 *      - name: end
 *        in: query
 *        description: End date for the expense period
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *          example: "2025-12-31"
 *      - name: min
 *        in: query
 *        description: Minimum expense value
 *        required: false
 *        schema:
 *          type: number
 *          example: 10
 *      - name: max
 *        in: query
 *        description: Maximum expense value
 *        required: false
 *        schema:
 *          type: number
 *          example: 10000
 *      - name: description
 *        in: query
 *        description: Description of the expense
 *        required: false
 *        schema:
 *          type: string
 *          example: "manga"
 *      - name: page
 *        in: query
 *        description: Page number for pagination
 *        required: false
 *        schema:
 *          type: integer
 *          example: 1
 *      - name: pageSize
 *        in: query
 *        description: Number of items per page
 *        required: false
 *        schema:
 *          type: integer
 *          example: 5
 *      - name: orderBy
 *        in: query
 *        description: Field to sort by
 *        required: false
 *        schema:
 *          type: string
 *          enum: [description, total, buyDate]
 *          example: "description"
 *      - name: orderDirection
 *        in: query
 *        description: Sort direction
 *        required: false
 *        schema:
 *          type: string
 *          enum: [ASC, DESC]
 *          example: "ASC"
 *    responses:
 *      '200':
 *        description: A list of expenses
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/ExpenseItemResponse'
 */ 
router.route('/').get(getExpenses);

export default router;