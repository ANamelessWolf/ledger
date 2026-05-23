import { NextFunction, Request, Response } from "express";
import { Exception, HTTP_STATUS, HttpResponse } from "../common";
import { asyncErrorHandler } from "../middlewares";
import { AppDataSource } from "..";
import { Currency, Owner } from "../models/settings";
import { Wallet, WalletGroup, WalletList, WalletMember } from "../models/ledger";
import { WalletType } from "../models/catalogs";
import { Expense } from "../models/expenses";

// ─── CURRENCIES ───────────────────────────────────────────────────────────────

export const getCurrencies = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currencies: Currency[] = await AppDataSource.manager.find(Currency, {
        order: { name: "ASC" },
      });
      const result = currencies.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        conversion: c.conversion,
        isDefault: c.conversion === 1,
      }));
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (err) {
      console.error("[getCurrencies]", err);
      return next(new Exception("An error occurred getting currencies", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const createCurrency = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, symbol, conversion } = req.body;
      if (!name || !symbol || conversion === undefined) {
        return next(new Exception("name, symbol and conversion are required", HTTP_STATUS.BAD_REQUEST));
      }
      if (Number(conversion) === 1) {
        return next(new Exception("Conversion 1 is reserved for the default currency", HTTP_STATUS.BAD_REQUEST));
      }
      const repo = AppDataSource.getRepository(Currency);
      const existing = await repo.findOne({ where: { name } });
      if (existing) {
        return next(new Exception("A currency with that name already exists", HTTP_STATUS.BAD_REQUEST));
      }
      const currency = repo.create({ name, symbol, conversion: Number(conversion) });
      const saved = await repo.save(currency);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: saved }));
    } catch (err) {
      console.error("[createCurrency]", err);
      return next(new Exception("An error occurred creating the currency", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateCurrency = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, symbol, conversion } = req.body;

      const currency = await AppDataSource.manager.findOne(Currency, { where: { id } });
      if (!currency) {
        return next(new Exception("Currency not found", HTTP_STATUS.NOT_FOUND));
      }
      if (currency.conversion === 1) {
        return next(new Exception("Cannot edit the default currency", HTTP_STATUS.BAD_REQUEST));
      }
      if (Number(conversion) === 1) {
        return next(new Exception("Conversion 1 is reserved for the default currency", HTTP_STATUS.BAD_REQUEST));
      }

      await AppDataSource.getRepository(Currency).update(id, {
        name,
        symbol,
        conversion: Number(conversion),
      });
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err) {
      console.error("[updateCurrency]", err);
      return next(new Exception("An error occurred updating the currency", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const deleteCurrency = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const currency = await AppDataSource.manager.findOne(Currency, { where: { id } });
      if (!currency) {
        return next(new Exception("Currency not found", HTTP_STATUS.NOT_FOUND));
      }
      if (currency.conversion === 1) {
        return next(new Exception("Cannot delete the default currency", HTTP_STATUS.BAD_REQUEST));
      }

      const walletUsing = await AppDataSource.manager.findOne(Wallet, { where: { currencyId: id } });
      if (walletUsing) {
        return next(new Exception("Cannot delete: this currency is in use by a wallet", HTTP_STATUS.BAD_REQUEST));
      }

      await AppDataSource.getRepository(Currency).delete(id);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err) {
      console.error("[deleteCurrency]", err);
      return next(new Exception("An error occurred deleting the currency", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const setDefaultCurrency = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const newDefault = await AppDataSource.manager.findOne(Currency, { where: { id } });
      if (!newDefault) {
        return next(new Exception("Currency not found", HTTP_STATUS.NOT_FOUND));
      }
      if (newDefault.conversion === 1) {
        return next(new Exception("This currency is already the default", HTTP_STATUS.BAD_REQUEST));
      }

      const allCurrencies = await AppDataSource.manager.find(Currency);
      const oldConversionFactor = newDefault.conversion;
      const repo = AppDataSource.getRepository(Currency);

      for (const c of allCurrencies) {
        if (c.id === id) {
          await repo.update(c.id, { conversion: 1 });
        } else {
          const newConversion = c.conversion / oldConversionFactor;
          await repo.update(c.id, { conversion: parseFloat(newConversion.toFixed(6)) });
        }
      }

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err) {
      console.error("[setDefaultCurrency]", err);
      return next(new Exception("An error occurred setting the default currency", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

// ─── WALLET GROUPS ────────────────────────────────────────────────────────────

export const getAllWalletGroups = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups: WalletGroup[] = await AppDataSource.manager.find(WalletGroup, {
        order: { name: "ASC" },
      });
      const walletList: WalletList[] = await AppDataSource.manager.find(WalletList);

      const result = groups.map((g) => {
        const members = walletList.filter((w) => w.walletGroupId === g.id);
        return {
          id: g.id,
          name: g.name,
          walletCount: members.length,
          currencies: members.map((m) => m.currency),
        };
      });

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (err) {
      console.error("[getAllWalletGroups]", err);
      return next(new Exception("An error occurred getting wallet groups", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const getWalletGroupById = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const group = await AppDataSource.manager.findOne(WalletGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Wallet group not found", HTTP_STATUS.NOT_FOUND));
      }

      const members: WalletMember[] = await AppDataSource.manager.find(WalletMember, {
        where: { walletGroupId: id },
      });

      const currencies = await AppDataSource.manager.find(Currency);
      const allWallets = await AppDataSource.manager.find(Wallet);

      const memberDetails = await Promise.all(
        members.map(async (m) => {
          const wallet = allWallets.find((w) => w.id === m.walletId);
          const currency = currencies.find((c) => c.id === wallet?.currencyId);
          const forwardWallet = m.forwardWalletId
            ? allWallets.find((w) => w.id === m.forwardWalletId)
            : null;
          return {
            memberId: m.id,
            walletId: m.walletId,
            walletName: wallet?.name ?? "",
            currencyId: wallet?.currencyId ?? 0,
            currencyName: currency?.name ?? "",
            currencySymbol: currency?.symbol ?? "",
            forwardWalletId: m.forwardWalletId ?? null,
            forwardWalletName: forwardWallet?.name ?? null,
          };
        })
      );

      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({ data: { id: group.id, name: group.name, members: memberDetails } })
      );
    } catch (err) {
      console.error("[getWalletGroupById]", err);
      return next(new Exception("An error occurred getting the wallet group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const createWalletGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, currencyIds } = req.body;

      if (!name || !currencyIds || !Array.isArray(currencyIds) || currencyIds.length === 0) {
        return next(new Exception("name and at least one currencyId are required", HTTP_STATUS.BAD_REQUEST));
      }

      const existingGroup = await AppDataSource.manager.findOne(WalletGroup, { where: { name } });
      if (existingGroup) {
        return next(new Exception("A wallet group with that name already exists", HTTP_STATUS.BAD_REQUEST));
      }

      const [owner] = await AppDataSource.manager.find(Owner, { order: { id: "ASC" }, take: 1 });
      if (!owner) {
        return next(new Exception("No owner found in the system", HTTP_STATUS.INTERNAL_SERVER_ERROR));
      }

      const [walletType] = await AppDataSource.manager.find(WalletType, { order: { id: "ASC" }, take: 1 });
      if (!walletType) {
        return next(new Exception("No wallet type found in the system", HTTP_STATUS.INTERNAL_SERVER_ERROR));
      }

      const currencies = await AppDataSource.manager.find(Currency);
      const groupRepo = AppDataSource.getRepository(WalletGroup);
      const walletRepo = AppDataSource.getRepository(Wallet);
      const memberRepo = AppDataSource.getRepository(WalletMember);

      const newGroup = groupRepo.create({ name });
      const savedGroup = await groupRepo.save(newGroup);

      for (const currencyId of currencyIds) {
        const currency = currencies.find((c) => c.id === Number(currencyId));
        if (!currency) continue;

        const walletName = `${name} ${currency.name}`;
        const wallet = walletRepo.create({
          ownerId: owner.id,
          walletTypeId: walletType.id,
          currencyId: currency.id,
          name: walletName,
        });
        const savedWallet = await walletRepo.save(wallet);

        const member = memberRepo.create({
          walletId: savedWallet.id,
          walletGroupId: savedGroup.id,
          forwardWalletId: null,
        });
        await memberRepo.save(member);
      }

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: savedGroup.id, name } }));
    } catch (err) {
      console.error("[createWalletGroup]", err);
      return next(new Exception("An error occurred creating the wallet group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateWalletGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;

      const group = await AppDataSource.manager.findOne(WalletGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Wallet group not found", HTTP_STATUS.NOT_FOUND));
      }

      if (name && name !== group.name) {
        const existing = await AppDataSource.manager.findOne(WalletGroup, { where: { name } });
        if (existing) {
          return next(new Exception("A wallet group with that name already exists", HTTP_STATUS.BAD_REQUEST));
        }

        const members: WalletMember[] = await AppDataSource.manager.find(WalletMember, {
          where: { walletGroupId: id },
        });
        const walletRepo = AppDataSource.getRepository(Wallet);
        const currencies = await AppDataSource.manager.find(Currency);

        for (const m of members) {
          const wallet = await AppDataSource.manager.findOne(Wallet, { where: { id: m.walletId } });
          if (wallet) {
            const currency = currencies.find((c) => c.id === wallet.currencyId);
            if (currency) {
              await walletRepo.update(wallet.id, { name: `${name} ${currency.name}` });
            }
          }
        }

        await AppDataSource.getRepository(WalletGroup).update(id, { name });
      }

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err) {
      console.error("[updateWalletGroup]", err);
      return next(new Exception("An error occurred updating the wallet group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const deleteWalletGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const group = await AppDataSource.manager.findOne(WalletGroup, { where: { id } });
      if (!group) {
        return next(new Exception("Wallet group not found", HTTP_STATUS.NOT_FOUND));
      }

      const members: WalletMember[] = await AppDataSource.manager.find(WalletMember, {
        where: { walletGroupId: id },
      });

      for (const m of members) {
        const count = await AppDataSource.manager.count(Expense, { where: { walletId: m.walletId } });
        if (count > 0) {
          return next(
            new Exception(
              `Cannot delete: wallet ${m.walletId} has associated expenses`,
              HTTP_STATUS.BAD_REQUEST
            )
          );
        }
      }

      const memberRepo = AppDataSource.getRepository(WalletMember);
      const walletRepo = AppDataSource.getRepository(Wallet);

      for (const m of members) {
        await memberRepo.delete(m.id);
        await walletRepo.delete(m.walletId);
      }

      await AppDataSource.getRepository(WalletGroup).delete(id);
      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id } }));
    } catch (err) {
      console.error("[deleteWalletGroup]", err);
      return next(new Exception("An error occurred deleting the wallet group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

// ─── WALLET MEMBER MANAGEMENT ─────────────────────────────────────────────────

export const addCurrencyToGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = parseInt(req.params.id, 10);
      const { currencyId, forwardWalletId } = req.body;

      const group = await AppDataSource.manager.findOne(WalletGroup, { where: { id: groupId } });
      if (!group) {
        return next(new Exception("Wallet group not found", HTTP_STATUS.NOT_FOUND));
      }

      const currency = await AppDataSource.manager.findOne(Currency, { where: { id: Number(currencyId) } });
      if (!currency) {
        return next(new Exception("Currency not found", HTTP_STATUS.BAD_REQUEST));
      }

      const existingMembers: WalletMember[] = await AppDataSource.manager.find(WalletMember, {
        where: { walletGroupId: groupId },
      });
      const existingWallets = await AppDataSource.manager.find(Wallet, {
        where: existingMembers.map((m) => ({ id: m.walletId })),
      });
      const alreadyExists = existingWallets.some((w) => w.currencyId === Number(currencyId));
      if (alreadyExists) {
        return next(new Exception("This currency is already in the wallet group", HTTP_STATUS.BAD_REQUEST));
      }

      const [owner] = await AppDataSource.manager.find(Owner, { order: { id: "ASC" }, take: 1 });
      const [walletType] = await AppDataSource.manager.find(WalletType, { order: { id: "ASC" }, take: 1 });

      if (!owner || !walletType) {
        return next(new Exception("System configuration error", HTTP_STATUS.INTERNAL_SERVER_ERROR));
      }

      const walletRepo = AppDataSource.getRepository(Wallet);
      const memberRepo = AppDataSource.getRepository(WalletMember);

      const wallet = walletRepo.create({
        ownerId: owner.id,
        walletTypeId: walletType.id,
        currencyId: currency.id,
        name: `${group.name} ${currency.name}`,
      });
      const savedWallet = await walletRepo.save(wallet);

      const member = memberRepo.create({
        walletId: savedWallet.id,
        walletGroupId: groupId,
        forwardWalletId: forwardWalletId ?? null,
      });
      const savedMember = await memberRepo.save(member);

      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({ data: { memberId: savedMember.id, walletId: savedWallet.id } })
      );
    } catch (err) {
      console.error("[addCurrencyToGroup]", err);
      return next(new Exception("An error occurred adding the currency to the group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const removeCurrencyFromGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = parseInt(req.params.memberId, 10);

      const member = await AppDataSource.manager.findOne(WalletMember, { where: { id: memberId } });
      if (!member) {
        return next(new Exception("Wallet member not found", HTTP_STATUS.NOT_FOUND));
      }

      const expenseCount = await AppDataSource.manager.count(Expense, { where: { walletId: member.walletId } });
      if (expenseCount > 0) {
        return next(new Exception("Cannot remove: this wallet has associated expenses", HTTP_STATUS.BAD_REQUEST));
      }

      await AppDataSource.getRepository(WalletMember).delete(memberId);
      await AppDataSource.getRepository(Wallet).delete(member.walletId);

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: memberId } }));
    } catch (err) {
      console.error("[removeCurrencyFromGroup]", err);
      return next(new Exception("An error occurred removing the currency from the group", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

export const updateMember = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const { forwardWalletId } = req.body;

      const member = await AppDataSource.manager.findOne(WalletMember, { where: { id: memberId } });
      if (!member) {
        return next(new Exception("Wallet member not found", HTTP_STATUS.NOT_FOUND));
      }

      await AppDataSource.getRepository(WalletMember).update(memberId, {
        forwardWalletId: forwardWalletId ?? null,
      });

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: { id: memberId } }));
    } catch (err) {
      console.error("[updateMember]", err);
      return next(new Exception("An error occurred updating the wallet member", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);

// ─── ALL WALLETS (for forward wallet selection) ───────────────────────────────

export const getAllWallets = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wallets: Wallet[] = await AppDataSource.manager.find(Wallet, { order: { name: "ASC" } });
      const currencies = await AppDataSource.manager.find(Currency);

      const result = wallets.map((w) => {
        const currency = currencies.find((c) => c.id === w.currencyId);
        return {
          id: w.id,
          name: w.name,
          currencyId: w.currencyId,
          currencyName: currency?.name ?? "",
          currencySymbol: currency?.symbol ?? "",
        };
      });

      res.status(HTTP_STATUS.OK).json(new HttpResponse({ data: result }));
    } catch (err) {
      console.error("[getAllWallets]", err);
      return next(new Exception("An error occurred getting wallets", HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }
);
