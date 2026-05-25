import { Router } from "express";
import { getExpensesById } from "../controllers/walletController";
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  setDefaultCurrency,
  getAllWalletGroups,
  getWalletGroupById,
  createWalletGroup,
  updateWalletGroup,
  deleteWalletGroup,
  addCurrencyToGroup,
  removeCurrencyFromGroup,
  updateMember,
  getAllWallets,
  toggleWalletGroupActive,
} from "../controllers/walletManageController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Ledger Wallet api
 */

// ─── Expenses (existing) ──────────────────────────────────────────────────────

/**
 * @swagger
 * /wallet/expenses/{id}:
 *  get:
 *    summary: Get a list of expenses
 *    tags: [Wallet]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      '200':
 *        description: A list of expenses
 */
router.route("/expenses/:id").get(getExpensesById);

// ─── Currencies ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /wallet/currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: List of currencies
 */
router.get("/currencies", getCurrencies);

/**
 * @swagger
 * /wallet/currencies:
 *   post:
 *     summary: Create a new currency
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, symbol, conversion]
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               conversion:
 *                 type: number
 *     responses:
 *       200:
 *         description: Created currency
 */
router.post("/currencies", createCurrency);

/**
 * @swagger
 * /wallet/currencies/{id}:
 *   put:
 *     summary: Update a currency
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/currencies/:id", updateCurrency);

/**
 * @swagger
 * /wallet/currencies/{id}:
 *   delete:
 *     summary: Delete a currency
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/currencies/:id", deleteCurrency);

/**
 * @swagger
 * /wallet/currencies/{id}/set-default:
 *   post:
 *     summary: Set a currency as default and recalculate all conversions
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default currency updated
 */
router.post("/currencies/:id/set-default", setDefaultCurrency);

// ─── Wallet Groups ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /wallet/groups:
 *   get:
 *     summary: Get all wallet groups
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: List of wallet groups
 */
router.get("/groups", getAllWalletGroups);

/**
 * @swagger
 * /wallet/groups/{id}:
 *   get:
 *     summary: Get a wallet group by id with members
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wallet group detail
 */
router.get("/groups/:id", getWalletGroupById);

/**
 * @swagger
 * /wallet/groups:
 *   post:
 *     summary: Create a wallet group with currencies
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, currencyIds]
 *             properties:
 *               name:
 *                 type: string
 *               currencyIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Created wallet group
 */
router.post("/groups", createWalletGroup);

/**
 * @swagger
 * /wallet/groups/{id}:
 *   put:
 *     summary: Update wallet group name
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/groups/:id", updateWalletGroup);

/**
 * @swagger
 * /wallet/groups/{id}:
 *   delete:
 *     summary: Delete a wallet group and all its wallets (only if no expenses)
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/groups/:id", deleteWalletGroup);

/**
 * @swagger
 * /wallet/groups/{id}/wallets:
 *   post:
 *     summary: Add a currency/wallet to a wallet group
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Added wallet to group
 */
router.post("/groups/:id/wallets", addCurrencyToGroup);
router.post("/groups/:id/toggle-active", toggleWalletGroupActive);

// ─── Wallet Members ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /wallet/members/{memberId}:
 *   delete:
 *     summary: Remove a wallet from a group (only if no expenses)
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/members/:memberId", removeCurrencyFromGroup);

/**
 * @swagger
 * /wallet/members/{memberId}:
 *   put:
 *     summary: Update a wallet member's forward wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated member
 */
router.put("/members/:memberId", updateMember);

// ─── All Wallets (catalog for forward selection) ──────────────────────────────

/**
 * @swagger
 * /wallet/all:
 *   get:
 *     summary: Get all wallets with currency info
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: List of wallets
 */
router.get("/all", getAllWallets);

export default router;
