import { FindManyOptions, In, MoreThanOrEqual } from "typeorm";
import {
  MontlyInstallmentFilter as MonthlyInstallmentFilter,
  MontlyInstallmentFilter,
} from "../types/filter/montlyInstallmentFilter";
import {
  MonthlyNonInterest,
  MonthlyNonInterestPayment,
} from "../models/banking";
import {
  CreditCardInstallmentTotal,
  MonthlyInstallmentResponse,
  MonthlyPayment,
} from "../types/response/monthlyInstallmentResponse";
import { Exception, HTTP_STATUS } from "../common";
import { formatDate, formatMonthKey, parseDate } from "./dateUtils";
import { Expense } from "../models/expenses";
import { Creditcard, WalletGroup } from "../models/ledger";
import { getCurrency, getExpenseType, getVendor } from "./expenseUtils";
import { Currency } from "../models/settings";
import { formatMoney } from "./formatUtils";
import { ExpenseType, Vendor } from "../models/catalogs";
import { MonthlyCreditCardInstallments } from "../models/banking/monthlyCreditCardInstallments";
import { AppDataSource } from "..";
import { CreditCardMonthlyInstTot } from "./creditCardMonthlyInstTot";
import { MonthlyInstallmentPayment } from "../models/banking/monthlyInstallmentPayments";
import { GroupedInstallment } from "../types/groupedInstallment";
import {
  ClassifiedInstallment,
  ClassifiedPayments,
  CreditCardCutDays,
  CreditCardInstallmentTotals,
  MonthlyInstallmentTotal,
} from "../types/newMonthlyInstallment";
import { CardBalance } from "../types/cardBalance";

/**
 *
 * @param filter
 * @returns
 */
export const getMonthlyFilter = (
  filter: MonthlyInstallmentFilter
): FindManyOptions<MonthlyNonInterest>["where"] => {
  const where: FindManyOptions<MonthlyNonInterest>["where"] = {};

  if (filter.creditcardId && filter.creditcardId.length > 0) {
    where.creditcardId = In(filter.creditcardId);
  }

  if (filter.archived) {
    where.archived = In([0, 1]);
  } else {
    where.archived = In([0]);
  }

  return where;
};

export const getMonthlyInstallmentItemResponse = async (
  installment: MonthlyNonInterest
): Promise<MonthlyInstallmentResponse> => {
  // Purchase
  const startDate: Date = parseDate(installment.startDate.toString());
  const purchase: Expense = await getExpensePurchase(installment);
  const creditCard: Creditcard = await getCreditCard(installment);
  const walletGroup: WalletGroup = await getWalletGroup(creditCard);
  const currency: Currency = await getCurrency(purchase);
  const vendor: Vendor = await getVendor(purchase);

  const item: MonthlyInstallmentResponse = {
    id: installment.id,
    startDate: startDate,
    buyDate: formatDate(startDate),
    purchase: {
      id: installment.expenseId,
      creditCardId: creditCard.id,
      card: walletGroup.name,
      description: purchase.description,
      walletGroupId: walletGroup.id,
      vendorId: vendor.id,
      vendor: vendor.description,
      total: formatMoney(purchase.total, `${currency.symbol} $`),
      value: purchase.total * currency.conversion,
    },
    payments: await getPayments(installment),
    months: installment.months,
    paidMonths: installment.paidMonths,
    isArchived: installment.archived === 1,
  };
  return item;
};

export const getWalletGroup = async (creditCard: Creditcard) => {
  const walletGroup: WalletGroup | null = await creditCard.walletGroup;
  if (walletGroup === null)
    throw new Exception(
      `Credit card has an invalid wallet groupId(${creditCard.walletGroupId}).`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return walletGroup;
};

export const getExpensePurchase = async (installment: MonthlyNonInterest) => {
  const purchase: Expense | null = await installment.expense;
  if (purchase === null)
    throw new Exception(
      `Installment has an invalid id(${installment.expenseId}) for the associated expense purchase`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return purchase;
};

export const getCreditCard = async (installment: MonthlyNonInterest) => {
  const creditCard: Creditcard | null = await installment.creditcard;
  if (creditCard === null)
    throw new Exception(
      `Installment has an invalid credit card id(${installment.creditcard}).`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return creditCard;
};

export const geExpensePayment = async (payment: MonthlyNonInterestPayment) => {
  const expensePayment: Expense | null = await payment.expense;
  if (expensePayment === null)
    throw new Exception(
      `Payment has an invalid id(${payment.expenseId}) for the associated expense`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  return expensePayment;
};

export const getPayments = async (installment: MonthlyNonInterest) => {
  const items: MonthlyNonInterestPayment[] | null = await installment.payments;
  const payments: MonthlyPayment[] = [];
  if (items !== null && items.length > 0) {
    for (let index = 0; index < items.length; index++) {
      const payment: MonthlyNonInterestPayment = items[index];
      const expense: Expense = await geExpensePayment(payment);
      const expenseDate: Date = parseDate(expense.buyDate.toString());
      const currency: Currency = await getCurrency(expense);
      const expenseType: ExpenseType = await getExpenseType(expense);
      payments.push({
        id: payment.id,
        purchaseId: payment.buyId,
        expenseId: expense.id,
        expenseTypeId: expenseType.id,
        expenseType: expenseType.description,
        expenseIcon: expenseType.icon,
        description: expense.description,
        total: formatMoney(expense.total, `${currency.symbol} $`),
        value: expense.total * currency.conversion,
        payDate: formatDate(expenseDate),
        expenseDate,
        isPaid: payment.isPaid === 1,
      });
    }
  }
  return sortPayments(payments);
};

export const getMonthlyInstallmentTotals = async (
  month: number,
  year: number,
  filter: MontlyInstallmentFilter
): Promise<CreditCardInstallmentTotal> => {
  // 1: Pick the selection options
  const options = getTotalSelOptions(month, year, filter);
  // 2: Select the installments
  const installments: MonthlyCreditCardInstallments[] =
    await AppDataSource.manager.find(MonthlyCreditCardInstallments, options);
  // 3: Calculates totals
  const totals = new CreditCardMonthlyInstTot();
  for (let index = 0; index < installments.length; index++) {
    const installment = installments[index];
    totals.updateBalance(installment);
  }
  // 4: Format the total response
  const result = totals.asTotalResponse();
  return result;
};

export const getMonthlyInstallmentTotals2 = async (
  month: number,
  year: number,
  filter: MontlyInstallmentFilter
): Promise<CreditCardInstallmentTotal> => {
  // 1: Pick the selection options
  const options = getTotalSelOptions(month, year, filter);
  // 2: Select the installments
  const installments: MonthlyCreditCardInstallments[] =
    await AppDataSource.manager.find(MonthlyCreditCardInstallments, options);
  // 3: Calculates totals
  const totals = new CreditCardMonthlyInstTot();
  for (let index = 0; index < installments.length; index++) {
    const installment = installments[index];
    totals.updateBalance(installment);
  }
  // 4: Format the total response
  const result = totals.asTotalResponse();
  return result;
};

export const payMonthlyInstallment = async (
  paymentId: number
): Promise<MonthlyNonInterestPayment> => {
  const payment: MonthlyNonInterestPayment | null =
    await AppDataSource.manager.findOne(MonthlyNonInterestPayment, {
      where: { id: paymentId },
    });
  // Validate id
  if (payment === null) {
    throw new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST);
  }

  // Check flag to pay
  payment.isPaid = 1;
  const result = await AppDataSource.manager.save(payment);
  return result;
};

export const updatePaidMonths = async (
  id: number,
  paidMonths: number
): Promise<MonthlyNonInterest> => {
  const installment: MonthlyNonInterest | null =
    await AppDataSource.manager.findOne(MonthlyNonInterest, {
      where: { id: id },
    });

  // Validate id
  if (installment === null) {
    throw new Exception(`Invalid id`, HTTP_STATUS.BAD_REQUEST);
  }

  installment.paidMonths = paidMonths;
  const result = await AppDataSource.manager.save(installment);
  return result;
};

export const groupInstallmentsById = (
  monthlyInstallments: MonthlyInstallmentPayment[]
): GroupedInstallment[] => {
  try {
    // Create a map to group by 'id'
    const groupedMap = new Map<number, GroupedInstallment>();

    // Iterate through the monthlyInstallments array
    monthlyInstallments.forEach((installment) => {
      const existingGroup = groupedMap.get(installment.id);

      if (existingGroup) {
        // Update the balance and total for the existing group
        existingGroup.total += installment.value;
        if (installment.isPaid === 0) {
          existingGroup.balance += installment.value;
        }
      } else {
        // Create a new group for the current installment
        groupedMap.set(installment.id, {
          id: installment.id,
          monthlyPayment: installment.value, // First monthlyPayment value is set as the installment's value
          balance: installment.isPaid === 0 ? installment.value : 0, // Add to balance only if isPaid is 0
          total: installment.value, // Set the initial total to the installment's value
        });
      }
    });

    // Convert the grouped map into an array
    return Array.from(groupedMap.values());
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const classifyMonthlyPayments = (
  payments: MonthlyInstallmentPayment[],
  cutDay: number
): ClassifiedPayments => {
  const classifiedPayments: ClassifiedPayments = {};
  try {
    for (const payment of payments) {
      const buyDate = new Date(payment.buyDate);
      let targetMonth = buyDate.getMonth() + 1; // Month is 0-based in JS
      let targetYear = buyDate.getFullYear();

      // Determine the classification month
      if (buyDate.getDate() > cutDay) {
        targetMonth += 1; // Move to next month
        if (targetMonth > 12) {
          targetMonth = 1;
          targetYear += 1;
        }
      }

      // Format key as MMYYYY
      const formattedKey = `${targetYear}${targetMonth
        .toString()
        .padStart(2, "0")}`;

      // Sum the values for that month
      if (!classifiedPayments[formattedKey]) {
        classifiedPayments[formattedKey] = 0;
      }
      classifiedPayments[formattedKey] += payment.value;
    }
  } catch (error) {
    console.log(error);
  }

  return classifiedPayments;
};

export const getCurrentMonthlyPayment = (
  classifiedPayments: ClassifiedPayments
): number => {
  try {
    // Get today's month and year
    const today = new Date();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
    const currentYear = today.getFullYear().toString();

    // Get the formatted key for this month
    const currentMonthKey = `${currentYear}${currentMonth}`;

    // Return the total sum for the current month or 0 if not found
    return classifiedPayments[currentMonthKey] || 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export function classifyInstallments(
  installments: MonthlyInstallmentPayment[],
  cutDays: CreditCardCutDays
): ClassifiedInstallment {
  const classifiedInstallments: ClassifiedInstallment = {};
  try {
    for (const installment of installments) {
      // Default cut day as 1 if missing
      const cutDay = cutDays[installment.creditCardId] ?? 1;
      const buyDate = new Date(installment.buyDate);
      let targetMonth = buyDate.getMonth() + 1; // JS Months are 0-based
      let targetYear = buyDate.getFullYear();

      // Determine the classification month
      if (buyDate.getDate() > cutDay) {
        targetMonth += 1;
        if (targetMonth > 12) {
          targetMonth = 1;
          targetYear += 1;
        }
      }

      // Format key as YYYYMM
      const formattedKey = `${targetYear}${targetMonth
        .toString()
        .padStart(2, "0")}`;

      // Check if the installment is already classified, if not, add it
      if (!classifiedInstallments[installment.id]) {
        classifiedInstallments[installment.id] = {
          creditCardId: installment.creditCardId,
          buyTotalValue: installment.buyTotalValue,
          payments: {},
          burnOutPayments: {},
        };
      }

      const record = classifiedInstallments[installment.id];

      // Update Payments
      if (!record.payments[formattedKey]) {
        record.payments[formattedKey] = 0;
        record.burnOutPayments[formattedKey] = 0;
      }
      record.payments[formattedKey] += installment.value;
    }

    // Calculate burnOutPayments
    for (const installmentId in classifiedInstallments) {
      const record = classifiedInstallments[parseInt(installmentId)];
      const sortedKeys = Object.keys(record.payments).sort();

      let remainingValue = record.buyTotalValue;
      for (const key of sortedKeys) {
        record.burnOutPayments[key] = remainingValue;
        remainingValue -= record.payments[key];
      }
    }
  } catch (error) {
    console.log(error);
  }
  return classifiedInstallments;
}

export function calculateInstallmentTotals(
  month: number,
  year: number,
  classifiedInstallments: ClassifiedInstallment
): MonthlyInstallmentTotal[] {
  const totalsMap: Record<string, MonthlyInstallmentTotal> = {};

  // Format filter key as YYYYMM
  const filterMonthKey = `${year}${month.toString().padStart(2, "0")}`;

  for (const installmentId in classifiedInstallments) {
    const installment = classifiedInstallments[parseInt(installmentId)];

    for (const monthKey in installment.payments) {
      if (monthKey < filterMonthKey) continue; // Skip months earlier than filter

      if (!totalsMap[monthKey]) {
        totalsMap[monthKey] = {
          label: formatMonthKey(monthKey),
          monthKey,
          balance: 0,
          payment: 0,
        };
      }

      totalsMap[monthKey].payment += installment.payments[monthKey];
      totalsMap[monthKey].balance += installment.burnOutPayments[monthKey];
    }
  }

  return Object.values(totalsMap).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );
}

export async function calculateCreditCardTotals(
  month: number,
  year: number,
  classifiedInstallments: ClassifiedInstallment,
  creditCards: Creditcard[]
): Promise<CreditCardInstallmentTotals> {
  const totals: CreditCardInstallmentTotals = {};
  const filterMonthKey = `${year}${month.toString().padStart(2, "0")}`;
  const creditCardName: Record<number, string> = {};
  // Map Credit Cards by ID for quick lookup
  const creditCardMap: Record<number, Creditcard> = {};
  for (const card of creditCards) {
    creditCardMap[card.id] = card;
    creditCardName[card.id] = (await card.walletGroup)?.name || "Unknown";
  }

  for (const installmentId in classifiedInstallments) {
    const installment = classifiedInstallments[parseInt(installmentId)];

    for (const monthKey in installment.payments) {
      if (monthKey < filterMonthKey) continue; // Skip previous months

      if (!totals[monthKey]) {
        totals[monthKey] = [];
      }

      const card = creditCardMap[installment.creditCardId] || {
        id: installment.creditCardId,
        color: "gray",
        card: "Unknown",
      };
      const cardName = creditCardName[card.id] || "Unknown";

      let cardBalance = totals[monthKey].find(
        (cb) => cb.id === installment.creditCardId
      );
      if (!cardBalance) {
        cardBalance = {
          id: installment.creditCardId,
          card: cardName,
          color: card.color || "gray",
          value: 0,
          percent: 0,
          monthly: 0,
        };
        totals[monthKey].push(cardBalance);
      }
      cardBalance.value += installment.burnOutPayments[monthKey];
      cardBalance.monthly += installment.payments[monthKey];
    }
  }

  // Calculate percentage per month
  for (const monthKey in totals) {
    const monthTotal = totals[monthKey].reduce(
      (sum, card) => sum + card.value,
      0
    );

    if (monthTotal > 0) {
      for (const card of totals[monthKey]) {
        card.percent = parseFloat(((card.value / monthTotal) * 100).toFixed(2));
      }
    }
  }

  return totals;
}

export const getCurrentMonthlyCreditTotals = (
  totals: CreditCardInstallmentTotals
): CardBalance[] => {
  try {
    // Get today's month and year
    const today = new Date();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
    const currentYear = today.getFullYear().toString();

    // Get the formatted key for this month
    const currentMonthKey = `${currentYear}${currentMonth}`;

    // Return the total sum for the current month or 0 if not found
    return totals[currentMonthKey] || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * Gets the total selection option to calculate the credit
 * card totals
 * @param month The month index from 1 to 12.
 * @param year A given year to use to filter
 * @param filter The current monthly selection filter
 * @returns The selection options.
 */
const getTotalSelOptions = (
  month: number,
  year: number,
  filter: MontlyInstallmentFilter
): FindManyOptions<MonthlyCreditCardInstallments> => {
  const formattedMonth = month.toString().padStart(2, "0");
  const period: number = +`${year}${formattedMonth}`;
  const where: FindManyOptions<MonthlyCreditCardInstallments>["where"] = {};
  if (filter.creditcardId && filter.creditcardId.length > 0) {
    where.creditCardId = In(filter.creditcardId);
  }
  where.period = MoreThanOrEqual(period);
  const options: FindManyOptions<MonthlyCreditCardInstallments> = { where };
  return options;
};

/**
 * Sorts an array of MonthlyPayment objects by expenseDate in ascending order.
 * @param payments Array of MonthlyPayment objects.
 * @returns Sorted array of MonthlyPayment objects.
 */
const sortPayments = (payments: MonthlyPayment[]): MonthlyPayment[] => {
  return payments.sort(
    (a, b) => a.expenseDate.getTime() - b.expenseDate.getTime()
  );
};
