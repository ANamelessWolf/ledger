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
 *     CreditCard:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the credit card summary
 *         preferredWalletId:
 *           type: number
 *           description: The id of the preferred wallet containing the credit card
 *         walletGroupId:
 *           type: number
 *           description: The id of the wallet group containing the credit card
 *         entityId:
 *           type: number
 *           description: The id of the entity associated with the credit card
 *         credit:
 *           type: number
 *           description: The total credit limit of the credit card
 *         usedCredit:
 *           type: number
 *           description: The amount of credit that has been used
 *         cutDay:
 *           type: number
 *           description: The credit card cut day
 *         dueDay:
 *           type: number
 *           description: The credit card due day
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
 *         active:
 *           type: number
 *           description: The credit card status
 *     CreditCardSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the credit card summary
 *         preferredWalletId:
 *           type: number
 *           description: The id of the wallet containing the credit card
 *         walletGroupId:
 *           type: number
 *           description: The id of the wallet group containing the credit card
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
 *     CreditCardPayment:
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
 *     CardSpending:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           description: The spending label as month name and year
 *         spending:
 *           type: number
 *           description: The spending amount
 *         period:
 *           type: string
 *           description: The spending period
 *         cutDate:
 *           type: date
 *           description: The credit card current cut date
 *     CardSpendingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The credit card id
 *         entityId:
 *           type: number
 *           description: The id of the entity associated with the credit card
 *         name:
 *           type: string
 *           description: The name of the credit card
 *         banking:
 *           type: string
 *           description: Banking details associated with the credit card
 *         ending:
 *           type: string
 *           description: The last four digits of the credit card number
 *         active:
 *           type: number
 *           description: The credit card active status
 *         average:
 *           type: string
 *           description: The spending payment average in the 12 month periods
 *         max:
 *           type: string
 *           description: The maximum spending in the 12 month periods
 *         min:
 *           type: string
 *           description: The minum spending in the 12 month periods
 *         spending:
 *             description: The credit card spending history
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CardSpending'
 */
import { Router } from "express";
import {
  addCreditcardPayment,
  getCreditcardSpendingHistoryById,
  getCreditcardSummary,
  getCreditcardSummarybyId,
  updateCreditcard,
} from "../controllers/creditcardController";

const router = Router();

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
 * /creditcard/{id}:
 *   post:
 *     summary: Update Credit card
 *     description: Update a credit card by id
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
 *            $ref: '#/components/schemas/CreditCard'
 *     responses:
 *       200:
 *         description: Successful operation. Returns the credit card summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreditCard'
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
 * /creditcard/spending/{id}:
 *   get:
 *     summary: Credit card spending history in 12 months
 *     description: Returns the spending history for a credit card id filter by id
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
 *         description: Successful operation. Returns the credit card spending history.
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/CardSpendingResponse' 
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

router.route("/summary").get(getCreditcardSummary);
router.route("/summary/:id").get(getCreditcardSummarybyId);
router.route("/payCreditcard/:id").put(addCreditcardPayment);
router.route("/spending/:id").get(getCreditcardSpendingHistoryById);

router.route("/:id").post(updateCreditcard);
// .put(updateCreditcard)
// .delete(deleteCreditcard);

export default router;
