/**
 * @swagger
 * components:
 *   schemas:
 *     DebitCardSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the debit card summary
 *         walletId:
 *           type: number
 *           description: The id of the wallet containing the debit card
 *         entityId:
 *           type: number
 *           description: The id of the entity associated with the debit card
 *         card:
 *           type: string
 *           description: The name or number of the debit card
 *         banking:
 *           type: string
 *           description: Banking details associated with the debit card
 *         investmentRate:
 *           type: string
 *           description: Saving account investment rate in percentage
 *         yearlyGain:
 *           type: string
 *           description: Yearly gain based in investment rate percentage
 *         total:
 *           type: string
 *           description: The amount of total cash on the account
 *         expiration:
 *           type: string
 *           description: The expiration date of the debit card
 *         cardType:
 *           type: number
 *           description: The type of the debit card (e.g., Visa, MasterCard)
 *         ending:
 *           type: string
 *           description: The last four digits of the debit card number
 *         color:
 *           type: string
 *           description: The color of the debit card
 *         cutDay:
 *           type: number
 *           description: The debit card cutDay
 */
import { Router } from "express";
import { getDebitcardSummary, getDebitcardSummarybyId, updateDebitcard } from "../controllers/debitcardController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Debitcard
 *   description: The debit card managing API
 * /debitcard/summary:
 *   get:
 *     summary: Debit card summaries
 *     description: Returns a summary for all debit cards
 *     tags: [Debitcard]
 *     responses:
 *       200:
 *         description: Successful operation. Returns the debit card summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DebitCardSummary'
 * /debitcard/{id}:
 *   post:
 *     summary: Update Debit card
 *     description: Update a debit card by id
 *     tags: [Debitcard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The debit card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/DebitCard'
 *     responses:
 *       200:
 *         description: Successful operation. Returns the credit card summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DebitCard' 
 * /debitcard/summary/{id}:
 *   get:
 *     summary: Debit card summary
 *     description: Returns a summary for a debit card id filter by id
 *     tags: [Debitcard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The debit card ID
 *     responses:
 *       200:
 *         description: Successful operation. Returns the debit card summary.
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/DebitCardSummary'
 */

router.route('/summary').get(getDebitcardSummary);
router.route('/summary/:id').get(getDebitcardSummarybyId);

router.route("/:id").post(updateDebitcard);

export default router;

