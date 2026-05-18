import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import {
  FinancingAccount,
  FinancingSection,
  Investment,
  Saving,
  Wallet,
  WalletMember,
} from "../models/ledger";
import { FinancingType } from "../models/catalogs";
import { Currency } from "../models/settings";
import { FinancingEntity } from "../models/banking";

// ─── GET ALL ─────────────────────────────────────────────────────────────────

export const getAllAccounts = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts: FinancingAccount[] = await AppDataSource.manager.find(
        FinancingAccount,
        { order: { name: "ASC" } }
      );
      const types: FinancingType[] = await AppDataSource.manager.find(FinancingType);
      const savings: Saving[] = await AppDataSource.manager.find(Saving);
      const investments: Investment[] = await AppDataSource.manager.find(Investment);

      const result = accounts.map((a) => {
        const type = types.find((t) => t.id === a.financingTypeId);
        const isSavings = savings.some((s) => s.financingAccountId === a.id);
        const accountType = isSavings
          ? "savings"
          : investments.some((i) => i.financingAccountId === a.id)
          ? "investment"
          : null;
        return {
          id: a.id,
          financingTypeId: a.financingTypeId,
          typeName: type?.description ?? "",
          accountType,
          name: a.name,
          description: a.description,
        };
      });

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (error) {
      return next(
        new Exception("An error occurred getting the accounts", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── GET BY ID ───────────────────────────────────────────────────────────────

export const getAccountById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const accountId = parseInt(id, 10);

      const account = await AppDataSource.manager.findOne(FinancingAccount, {
        where: { id: accountId },
      });
      if (!account) {
        return next(new Exception("Account not found", HTTP_STATUS.NOT_FOUND));
      }

      const type = await AppDataSource.manager.findOne(FinancingType, {
        where: { id: account.financingTypeId },
      });

      const sections: FinancingSection[] = await AppDataSource.manager.find(
        FinancingSection,
        { where: { financingAccountId: accountId } }
      );

      const currencies: Currency[] = await AppDataSource.manager.find(Currency);
      const defaultCurrency = currencies.find((c) => c.conversion === 1) ?? currencies[0];

      const sectionsWithCurrency = sections.map((s) => {
        const currency = currencies.find((c) => c.id === s.currencyId);
        const balanceInDefault = currency
          ? s.balance / currency.conversion
          : s.balance;
        return {
          ...s,
          currencySymbol: currency?.symbol ?? "",
          currencyName: currency?.name ?? "",
          balanceInDefault,
        };
      });

      const totalBalance = sectionsWithCurrency.reduce(
        (sum, s) => sum + s.balanceInDefault,
        0
      );

      let detail: any = null;
      let accountType: "savings" | "investment" | null = null;

      const savingRecord = await AppDataSource.manager.findOne(Saving, {
        where: { financingAccountId: accountId },
      });

      if (savingRecord) {
        accountType = "savings";
        const wallet = await AppDataSource.manager.findOne(Wallet, {
          where: { id: savingRecord.preferredWalletId },
        });
        const entity = await AppDataSource.manager.findOne(FinancingEntity, {
          where: { id: savingRecord.entityId },
        });
        const currency = currencies.find((c) => c.id === savingRecord.currencyId);
        detail = {
          ...savingRecord,
          walletName: wallet?.name ?? "",
          entityName: entity?.name ?? "",
          currencySymbol: currency?.symbol ?? "",
          currencyName: currency?.name ?? "",
        };
      } else {
        const investmentRecord = await AppDataSource.manager.findOne(Investment, {
          where: { financingAccountId: accountId },
        });
        if (investmentRecord) {
          accountType = "investment";
          const currency = currencies.find((c) => c.id === investmentRecord.currencyId);
          detail = {
            ...investmentRecord,
            currencySymbol: currency?.symbol ?? "",
            currencyName: currency?.name ?? "",
          };
        }
      }

      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: {
            account: {
              id: account.id,
              financingTypeId: account.financingTypeId,
              typeName: type?.description ?? "",
              accountType,
              name: account.name,
              description: account.description,
            },
            detail,
            sections: sectionsWithCurrency,
            totalBalance,
            defaultCurrencySymbol: defaultCurrency?.symbol ?? "",
          },
        })
      );
    } catch (error) {
      return next(
        new Exception("An error occurred getting the account", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createAccount = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, financingTypeId, savings, investment } = req.body;

      const type = await AppDataSource.manager.findOne(FinancingType, {
        where: { id: financingTypeId },
      });
      if (!type) {
        return next(new Exception("Invalid financing type", HTTP_STATUS.BAD_REQUEST));
      }

      const accountRepo = AppDataSource.getRepository(FinancingAccount);
      const sectionRepo = AppDataSource.getRepository(FinancingSection);

      const newAccount = accountRepo.create({ name, description, financingTypeId });
      const savedAccount = await accountRepo.save(newAccount);
      const accountId = savedAccount.id;

      let currencyId: number;
      const isSavings = !!savings;

      if (isSavings) {
        const { preferredWalletId, walletGroupId, entityId, currencyId: cid, balance } = savings;
        currencyId = cid;

        const savingRepo = AppDataSource.getRepository(Saving);
        const newSaving = savingRepo.create({
          preferredWalletId,
          walletGroupId: walletGroupId ?? null,
          entityId,
          financingAccountId: accountId,
          currencyId,
          balance: balance ?? 0,
        });
        await savingRepo.save(newSaving);
      } else {
        const { currencyId: cid, balance } = investment;
        currencyId = cid;

        const investmentRepo = AppDataSource.getRepository(Investment);
        const newInvestment = investmentRepo.create({
          currencyId,
          financingAccountId: accountId,
          balance: String(balance ?? "0"),
        });
        await investmentRepo.save(newInvestment);
      }

      const mainSection = sectionRepo.create({
        financingAccountId: accountId,
        currencyId,
        name: "main",
        balance: isSavings ? (savings?.balance ?? 0) : Number(investment?.balance ?? 0),
        isInvestment: 0,
        isLocked: 0,
        isAvailable: 1,
        investmentRate: null,
        investmentStartDate: null,
        investmentEndDate: null,
      });
      await sectionRepo.save(mainSection);

      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({ data: { id: accountId, name, description, financingTypeId } })
      );
    } catch (error) {
      return next(
        new Exception("An error occurred creating the account", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateAccount = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const accountId = parseInt(id, 10);
      const { name, description, mainBalance } = req.body;

      const account = await AppDataSource.manager.findOne(FinancingAccount, {
        where: { id: accountId },
      });
      if (!account) {
        return next(new Exception("Account not found", HTTP_STATUS.NOT_FOUND));
      }

      await AppDataSource.getRepository(FinancingAccount).update(accountId, { name, description });

      if (mainBalance !== undefined) {
        const balance = Number(mainBalance);

        const mainSection = await AppDataSource.manager.findOne(FinancingSection, {
          where: { financingAccountId: accountId, name: "main" },
        });
        if (mainSection) {
          await AppDataSource.getRepository(FinancingSection).update(mainSection.id, { balance });
        }

        const saving = await AppDataSource.manager.findOne(Saving, {
          where: { financingAccountId: accountId },
        });
        if (saving) {
          await AppDataSource.getRepository(Saving).update(saving.id, { balance });
        } else {
          const investment = await AppDataSource.manager.findOne(Investment, {
            where: { financingAccountId: accountId },
          });
          if (investment) {
            await AppDataSource.getRepository(Investment).update(investment.id, {
              balance: String(balance),
            });
          }
        }
      }

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: accountId } }));
    } catch (error) {
      return next(
        new Exception("An error occurred updating the account", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── DELETE (pending) ─────────────────────────────────────────────────────────

export const deleteAccount = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTP_STATUS.OK).json(
      new HttpResponse({ data: { message: "Delete pending implementation" } })
    );
  }
);

// ─── GET WALLET BY GROUP + CURRENCY ──────────────────────────────────────────

export const getPreferredWallet = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId, currencyId } = req.params;

      const members: WalletMember[] = await AppDataSource.manager.find(
        WalletMember,
        { where: { walletGroupId: parseInt(groupId, 10) } }
      );

      const walletIds = members.map((m) => m.walletId);
      if (walletIds.length === 0) {
        return next(new Exception("No wallets found for this group", HTTP_STATUS.NOT_FOUND));
      }

      const wallets: Wallet[] = await AppDataSource.manager.find(Wallet, {
        where: walletIds.map((wid) => ({ id: wid, currencyId: parseInt(currencyId, 10) })),
      });

      if (wallets.length === 0) {
        return next(
          new Exception("No wallet with that currency in this group", HTTP_STATUS.NOT_FOUND)
        );
      }

      const w = wallets[0];
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({ data: { id: w.id, name: w.name, currencyId: w.currencyId } })
      );
    } catch (error) {
      return next(
        new Exception("An error occurred getting the preferred wallet", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── SECTION: CREATE ─────────────────────────────────────────────────────────

export const createSection = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const accountId = parseInt(id, 10);
      const {
        currencyId,
        name,
        balance,
        isInvestment,
        isLocked,
        isAvailable,
        investmentRate,
        investmentStartDate,
        investmentEndDate,
      } = req.body;

      const account = await AppDataSource.manager.findOne(FinancingAccount, {
        where: { id: accountId },
      });
      if (!account) {
        return next(new Exception("Account not found", HTTP_STATUS.NOT_FOUND));
      }

      const sectionRepo = AppDataSource.getRepository(FinancingSection);
      const section = sectionRepo.create({
        financingAccountId: accountId,
        currencyId,
        name,
        balance: balance ?? 0,
        isInvestment: isInvestment ? 1 : 0,
        isLocked: isLocked ? 1 : 0,
        isAvailable: isAvailable ? 1 : 0,
        investmentRate: investmentRate ?? null,
        investmentStartDate: investmentStartDate ?? null,
        investmentEndDate: investmentEndDate ?? null,
      });
      const saved = await sectionRepo.save(section);

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: saved }));
    } catch (error) {
      return next(
        new Exception("An error occurred creating the section", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── SECTION: UPDATE ─────────────────────────────────────────────────────────

export const updateSection = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const sid = parseInt(sectionId, 10);
      const {
        currencyId,
        name,
        balance,
        isInvestment,
        isLocked,
        isAvailable,
        investmentRate,
        investmentStartDate,
        investmentEndDate,
      } = req.body;

      const section = await AppDataSource.manager.findOne(FinancingSection, {
        where: { id: sid },
      });
      if (!section) {
        return next(new Exception("Section not found", HTTP_STATUS.NOT_FOUND));
      }
      if (section.name === "main") {
        return next(new Exception("Cannot edit the main section via this endpoint", HTTP_STATUS.BAD_REQUEST));
      }

      await AppDataSource.getRepository(FinancingSection).update(sid, {
        currencyId,
        name,
        balance: balance ?? 0,
        isInvestment: isInvestment ? 1 : 0,
        isLocked: isLocked ? 1 : 0,
        isAvailable: isAvailable ? 1 : 0,
        investmentRate: investmentRate ?? null,
        investmentStartDate: investmentStartDate ?? null,
        investmentEndDate: investmentEndDate ?? null,
      });

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: sid } }));
    } catch (error) {
      return next(
        new Exception("An error occurred updating the section", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);

// ─── SECTION: DELETE ─────────────────────────────────────────────────────────

export const deleteSection = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const sid = parseInt(sectionId, 10);

      const section = await AppDataSource.manager.findOne(FinancingSection, {
        where: { id: sid },
      });
      if (!section) {
        return next(new Exception("Section not found", HTTP_STATUS.NOT_FOUND));
      }
      if (section.name === "main") {
        return next(new Exception("Cannot delete the main section", HTTP_STATUS.BAD_REQUEST));
      }

      await AppDataSource.getRepository(FinancingSection).delete(sid);

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: sid } }));
    } catch (error) {
      return next(
        new Exception("An error occurred deleting the section", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  }
);
