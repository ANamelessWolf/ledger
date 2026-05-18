import { Router } from "express";
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getPreferredWallet,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/accountController";

const router = Router();

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all financing accounts
 *     operationId: getAllAccounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: List of financing accounts
 */
router.get("/", getAllAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get a financing account by id with detail and sections
 *     operationId: getAccountById
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account detail
 */
router.get("/:id", getAccountById);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new financing account with savings or investment detail
 *     operationId: createAccount
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, financingTypeId]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               financingTypeId:
 *                 type: integer
 *               savings:
 *                 type: object
 *               investment:
 *                 type: object
 *     responses:
 *       200:
 *         description: Created account
 */
router.post("/", createAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update account name and description
 *     operationId: updateAccount
 *     tags: [Accounts]
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
router.put("/:id", updateAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete an account (pending implementation)
 *     operationId: deleteAccount
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pending
 */
router.delete("/:id", deleteAccount);

/**
 * @swagger
 * /accounts/wallet/{groupId}/{currencyId}:
 *   get:
 *     summary: Get the preferred wallet for a given wallet group and currency
 *     operationId: getPreferredWallet
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Preferred wallet
 */
router.get("/wallet/:groupId/:currencyId", getPreferredWallet);

/**
 * @swagger
 * /accounts/{id}/sections:
 *   post:
 *     summary: Add a section to an account
 *     operationId: createSection
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Created section
 */
router.post("/:id/sections", createSection);

/**
 * @swagger
 * /accounts/sections/{sectionId}:
 *   put:
 *     summary: Update a section
 *     operationId: updateSection
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated section
 */
router.put("/sections/:sectionId", updateSection);

/**
 * @swagger
 * /accounts/sections/{sectionId}:
 *   delete:
 *     summary: Delete a section
 *     operationId: deleteSection
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted section
 */
router.delete("/sections/:sectionId", deleteSection);

export default router;
