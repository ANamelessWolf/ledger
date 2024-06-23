/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentStatus:
 *       type: object
 *       properties:
 *         cutDate:
 *           type: string
 *           description: The cut-off date for the billing period
 *         dueDate:
 *           type: string
 *           description: The due date for the payment
 *         billing:
 *           type: object
 *           properties:
 *             period:
 *               type: string
 *               description: The billing period
 *             start:
 *               type: string
 *               description: The start date of the billing period
 *             end:
 *               type: string
 *               description: The end date of the billing period
 *           description: Billing details including period, start date, and end date
 *         status:
 *           type: string
 *           description: The current payment status
 *         total:
 *           type: string
 *           description: The total amount due
 *     CreditCardSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the credit card summary
 *         walletId:
 *           type: number
 *           description: The id of the wallet containing the credit card
 *         entityId:
 *           type: number
 *           description: The id of the entity associated with the credit card
 *         card:
 *           type: string
 *           description: The name or number of the credit card
 *         banking:
 *           type: string
 *           description: Banking details associated with the credit card
 *         credit:
 *           type: string
 *           description: The total credit limit of the credit card
 *         available:
 *           type: string
 *           description: The credit available balance
 *         usedCredit:
 *           type: string
 *           description: The amount of credit that has been used
 *         status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *           description: The current status of the credit card (e.g., active, blocked)
 *         expiration:
 *           type: string
 *           description: The expiration date of the credit card
 *         cardType:
 *           type: number
 *           description: The type of the credit card (e.g., Visa, MasterCard)
 *         ending:
 *           type: string
 *           description: The last four digits of the credit card number
 *         color:
 *           type: string
 *           description: The color of the credit card
 *     CreditcardPayment:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the credit card payment
 *         creditcardId:
 *           type: number
 *           description: The credit card id
 *         paymentTotal:
 *           type: number
 *           description: The payment total in decimal value
 *         paymentDate:
 *           type: string
 *           description: The date of payment
 *         paymentCutDate:
 *           type: string
 *           description: The date payment cut date
 *         paymentDueDate:
 *           type: string
 *           format: date
 *           description: The date payment due date
 */
import { Router } from "express";
import { addCreditcardPayment, getCreditcardSummary, getCreditcardSummarybyId } from "../controllers/creditcardController";

const router = Router();

/*
router.route('/:id')
	.get(getCreditcard)
	.put(updateCreditcard)
	.delete(deleteCreditcard);
*/

/**
 * @swagger
 * tags:
 *   name: Creditcard
 *   description: The credit card managing API
 * /creditcard/summary:
 *   get:
 *     summary: Credit card summaries
 *     description: Returns a summary for all credit cards
 *     tags: [Creditcard]
 *     responses:
 *       200:
 *         description: Successful operation. Returns the credit card summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreditCardSummary'
 * /creditcard/summary/{id}:
 *   get:
 *     summary: Credit card summary
 *     description: Returns a summary for a credit card id filter by id
 *     tags: [Creditcard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The credit card ID
 *     responses:
 *       200:
 *         description: Successful operation. Returns the credit card summary.
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/CreditCardSummary'
 * /creditcard/payCreditcard/{id}:
 *   put:
 *     summary: Add a payment to a credit card
 *     description: Adds a payment to a given Credit Card via it credit card id
 *     tags: [Creditcard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The credit card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total:
 *                 type: number
 *                 description: The payment total in decimal value
 *               payDate:
 *                 type: string
 *                 format: date
 *                 description: The date of payment
 *               cutDate:
 *                 type: string
 *                 format: date
 *                 example: Credit card cut date period
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: Credit card due date
 *     responses:
 *       200:
 *         description: Successfully added payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreditcardPayment'
 */

router.route('/summary').get(getCreditcardSummary);
router.route('/summary/:id').get(getCreditcardSummarybyId);
router.route('/payCreditcard/:id').put(addCreditcardPayment);

export default router;

