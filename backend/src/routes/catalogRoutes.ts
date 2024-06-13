/**
 * @swagger
 * components:
 *   schemas:
 *     CardItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: Credit card, or debit card id
 *         entityId:
 *           type: number
 *           description: The financing entity id, or bank id
 *         isCreditCard:
 *           type: number
 *           description: A flag, 1 the card is credit card, 0 for a debit card
 *         entity:
 *           type: string
 *           description: The financing entity or bank name
 *         ending:
 *           type: string
 *           description: Card ending digits
 *         active:
 *           type: number
 *           description: A flag to check if the card is active, 1 for active
 */
import { Router } from "express";
import { getCardList } from "../controllers/catalogController";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Catalogs
 *   description: Ledger catalogs api
 * /catalog/cards:
 *   get:
 *     summary: The list of cards, debit and credit cards
 *     description: Returns a list of cards
 *     tags: [Catalogs]
 *     parameters:
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *         description: Filter by entity ID
 *       - in: query
 *         name: isCreditCard
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by credit card (1) or debit card (0)
 *       - in: query
 *         name: active
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by active status (1 for active, 0 for inactive)
 *     responses:
 *       200:
 *         description: Successful operation. Returns the cards list.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CardItem'
 */ 
router.route('/cards').get(getCardList);

export default router;