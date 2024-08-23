import { Router } from "express";
import { getMonthlyInstallments } from "../controllers/monthlyController";

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseExpense:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         creditCardId:
 *           type: integer
 *           example: 1
 *         card:
 *           type: string
 *           example: "BBVA Nomina"
 *         walletGroupId:
 *           type: integer
 *           example: 1
 *         description:
 *           type: string
 *           example: "Compra Laptop a 12 mesese sin interes"
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
 *         total:
 *           type: string
 *           example: "MXN $10,000.00"
 *         value:
 *           type: number
 *           example: 10000
 *     MonthlyPayment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         purchaseId:
 *           type: integer
 *           example: 12
 *         expenseId:
 *           type: integer
 *           example: 45
 *         description:
 *           type: string
 *           example: "Préstamo por transferencia"
 *         total:
 *           type: string
 *           example: "MXN $10,000.00"
 *         value:
 *           type: number
 *           example: 10000
 *         payDate:
 *           type: string
 *           example: "May 17, 2023"
 *         expenseDate:
 *           type: date
 *           example: "2024-08-21"
 *         isPaid:
 *           type: boolean
 *           example: true
 *     CreditCardInstallmentTotal:
 *       type: object
 *       properties:
 *         creditCardId:
 *           type: integer
 *           example: 18
 *         creditCard:
 *           type: string
 *           example: "BBVA Nomina"
 *         currentBalance:
 *           type: number
 *           example: 200.00
 *         paid:
 *           type: number
 *           example: 800.15
 *         total:
 *           type: number
 *           example: 1200.15
 *     InstallmentTotal:
 *       type: object
 *       properties:
 *         currentBalance:
 *           type: number
 *           example: 200.00
 *         paid:
 *           type: number
 *           example: 800.15
 *         total:
 *           type: number
 *           example: 1200.15
 */

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Monthly Installments
 *   description: Ledger monthly installments api
 * /monthly:
 *  get:
 *    summary: Get a list of all monthly installments
 *    description: Retrieve a list of monthly installments filtered by various criteria.
 *    tags: [Monthly Installments]
 *    parameters:
 *      - name: creditcardId
 *        in: query
 *        description: Comma-separated list of credit card IDs
 *        required: false
 *        schema:
 *          type: string
 *          example: "7,4"
 *      - name: archived
 *        in: query
 *        description: If set to one also include archived installments
 *        required: false
 *        schema:
 *          type: number
 *          example: 1
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
 *          enum: [creditcardId, months, paidMonths]
 *          example: "creditcardId"
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
 *        description: A list of monthly installments
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/MonthlyInstallmentResponse'
 */
router.route("/").get(getMonthlyInstallments);

export default router;