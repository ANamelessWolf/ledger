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
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         walletId:
 *           type: integer
 *           example: 12
 *         expenseTypeId:
 *           type: integer
 *           example: 45
 *         vendorId:
 *           type: integer
 *           example: 34
 *         description:
 *           type: string
 *           example: "Préstamo por transferencia"
 *         total:
 *           type: string
 *           example: "MXN $10,000.00"
 *         buyDate:
 *           type: string
 *           example: "May 17, 2023"
 *     DailyExpense:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           format: double
 *           example: 10000.0
 *         buy_date:
 *           type: string
 *           format: date
 *           example: "2023-05-18"
 *         dayId:
 *           type: integer
 *           example: 18
 *         monthId:
 *           type: integer
 *           example: 5
 *         yearId:
 *           type: integer
 *           example: 2023
 *         weekDay:
 *           type: integer
 *           example: 5
 *     ExpensesByExpenseType:
 *       type: object
 *       properties:
 *         expenseTypeId:
 *           type: integer
 *           example: 59
 *         expenseType:
 *           type: string
 *           example: "PPR"
 *         totalMxn:
 *           type: number
 *           example: 96000.0
 *         total:
 *          type: string
 *          example: "MXN $96,000.00"
 *     ExpensesByVendor:
 *       type: object
 *       properties:
 *         vendorId:
 *           type: integer
 *           example: 10
 *         vendor:
 *           type: string
 *           example: "Mercado Libre México"
 *         totalMxn:
 *           type: number
 *           example: 12299.0
 *         total:
 *          type: string
 *          example: "MXN $12,299.00"
 */
import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getDailyExpenses,
  getExpenses,
  getExpenseSummaryByType,
  getExpenseSummaryByVendor,
  updateExpense,
} from "../controllers/expenseController";
import { syncMobileExpenses } from "../controllers/mobileSyncController";

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
 *      - name: excludeInstallmentParents
 *        in: query
 *        description: >
 *          When "true", excludes the parent expense of interest-free monthly purchases
 *          (`monthly_with_no_interest.expense_id`); their monthly installments are still returned.
 *          Used by the mobile app. Defaults to false (unchanged behavior).
 *        required: false
 *        schema:
 *          type: boolean
 *          example: true
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
 *  post:
 *     summary: Add an expense
 *     description: Adds an expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Successfully added payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 * /expenses/sync:
 *   post:
 *     summary: Idempotent batch upload of mobile expenses
 *     description: >
 *       Inserts up to 10 expenses created offline in the mobile app. Each item carries a
 *       stable client-generated `syncKey`; resending a key that was already stored returns
 *       the existing expense id instead of inserting a duplicate. Valid items are inserted
 *       in a single transaction; if it fails, it is rolled back and one row per item is
 *       written to `expense_sync_error_log`. Responds 200 whenever the batch was processed;
 *       check each item's `success`.
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenses:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required: [syncKey, walletId, expenseTypeId, vendorId, description, total, buyDate]
 *                   properties:
 *                     syncKey: { type: string, example: "3f0b6c2e-8a51-4b7e-9d0e-2b1d9c4a7e10" }
 *                     walletId: { type: integer, example: 7 }
 *                     expenseTypeId: { type: integer, example: 3 }
 *                     vendorId: { type: integer, example: 23 }
 *                     description: { type: string, maxLength: 120, example: "Groceries" }
 *                     total: { type: number, example: 1250.5 }
 *                     currencyFactor: { type: number, nullable: true, example: 17.31 }
 *                     buyDate: { type: string, format: date, example: "2026-10-03" }
 *     responses:
 *       200:
 *         description: Per-item results in request order.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       syncKey: { type: string }
 *                       success: { type: boolean }
 *                       remoteId: { type: integer }
 *                       alreadySynced: { type: boolean }
 *                       errorCode: { type: string, example: "BATCH_FAILED" }
 *                       databaseErrorCode: { type: string, example: "ER_NO_REFERENCED_ROW_2" }
 *                       message: { type: string }
 *       400:
 *         description: Invalid envelope (not an array, empty, more than 10 items or duplicate keys).
 * /expenses/daily/{month}/{year}:
 *  get:
 *    summary: Get daily expenses by month and year
 *    description: Retrieves a list of daily expenses for a specific month and year.
 *    tags: [Expenses]
 *    parameters:
 *      - name: month
 *        in: path
 *        description: The month for which to retrieve daily expenses.
 *        required: true
 *        schema:
 *          type: integer
 *          format: int32
 *          example: 5  # Example month, May
 *      - name: year
 *        in: path
 *        description: The year for which to retrieve daily expenses.
 *        required: true
 *        schema:
 *          type: integer
 *          format: int32
 *          example: 2023  # Example year
 *    responses:
 *      '200':
 *        description: An array of daily expenses for the given month and year.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/DailyExpense'
 *      '404':
 *        description: No expenses found for the specified month and year.
 * /expenses/summary/type/{frequency}:
 *   get:
 *     summary: Get total expenses grouped by expense type
 *     description: >
 *       Returns the total expenses grouped by expense type in MXN for the last N months.
 *       Excludes parent monthly purchases and their installment payments.
 *     tags: [Expenses]
 *     parameters:
 *       - name: frequency
 *         in: path
 *         description: Number of months to look back (e.g., 1, 6, 12)
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 6
 *     responses:
 *       '200':
 *         description: Expense summary grouped by type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpensesByExpenseType'
 *       '400':
 *         description: Invalid frequency parameter.
 *       '500':
 *         description: Error processing the request
 * /expenses/summary/vendor/{frequency}:
 *   get:
 *     summary: Get total expenses grouped by vendor
 *     description: >
 *       Returns the total expenses grouped by vendor in MXN for the last N months.
 *       Excludes parent monthly purchases and their installment payments.
 *     tags: [Expenses]
 *     parameters:
 *       - name: frequency
 *         in: path
 *         description: Number of months to look back (e.g., 1, 6, 12)
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 12
 *     responses:
 *       '200':
 *         description: Expense summary grouped by vendor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpensesByVendor'
 *       '400':
 *         description: Invalid frequency parameter.
 *       '500':
 *         description: Error processing the request.
 */
router.route("/").get(getExpenses).post(createExpense);
router.route("/sync").post(syncMobileExpenses);
router.route("/:id").put(updateExpense).delete(deleteExpense);
router.route("/daily/:month/:year").get(getDailyExpenses);
router.route("/summary/type/:frequency").get(getExpenseSummaryByType);
router.route("/summary/vendor/:frequency").get(getExpenseSummaryByVendor);

export default router;
