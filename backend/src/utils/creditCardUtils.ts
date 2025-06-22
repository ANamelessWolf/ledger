import { In } from "typeorm";
import { AppDataSource } from "..";
import { PaymentMap } from "../common";
import { PAYMENT_STATUS } from "../common/enums";
import { FinancingEntity, MonthlyNonInterest } from "../models/banking";
import { MonthlyInstallmentPayment } from "../models/banking/monthlyInstallmentPayments";
import { Creditcard, CreditcardPayment, Wallet } from "../models/ledger";
import { CardSpending } from "../types/cardSpending";
import { CardListFilter } from "../types/filter/cardListFilter";
import {
  CreditCardPeriod,
  EMPTY_PAYMENT_STATUS,
  PaymentStatus,
} from "../types/paymentStatus";
import { CreditCardSummaryInstallmentTotal } from "../types/response/creditCardSummaryResponse";
import {
  findSurroundingPeriods,
  getPaymentStatus,
} from "./creditCardPeriodUtils";
import {
  adjustDueDate,
  formatDate,
  getMonthName,
  getPeriodName,
  parseDate,
} from "./dateUtils";
import { formatMoney } from "./formatUtils";
import {
  classifyMonthlyPayments,
  getCurrentMonthlyPayment,
} from "./monthlyInstallmentUtils";

/**
 * Retrieves the credit card payment status for a specific date.
 *
 * @param date - The target date to determine the credit card status.
 * @param payments - Array of credit card payments to check for any existing payments in the period.
 * @param cutday - The cut-off day of the month for generating credit card billing periods.
 * @returns PaymentStatus - The status of the credit card payment for the specified date.
 */
export const getCreditCardStatus = (
  date: Date,
  payments: CreditcardPayment[],
  cutday: number,
  daysToPay: number = 20
): PaymentStatus => {
  try {
    // Generate periods for the current year and find the relevant period for the date
    const currentYear = date.getFullYear();
    const periods = generateCreditCardPeriods(cutday, currentYear, daysToPay);

    const { previous, current, next } = findSurroundingPeriods(date, periods);
    const period = current;
    if (!period) {
      throw new Error("No valid credit card period found for the given date.");
    }

    // Step 2: Set cutDate and dueDate from the given period
    const cutDate = current.cutDate.dateValue;
    let dueDate = current.dueDate.dateValue;
    if (date <= previous.dueDate.dateValue) {
      dueDate = previous.dueDate.dateValue;
    }

    // Define the `payment` object
    const payment = {
      startDate: cutDate,
      dueDate: dueDate,
    };

    // Step 3: Check for existing payments in the specified period (cutDate + 1 to dueDate)
    const { total, status } = getPaymentStatus(
      date,
      previous,
      current,
      next,
      payments
    );

    // Step 5: Define the billing period details
    let billing = {
      period: period.period.key,
      start: formatDate(period.billing.start.dateValue),
      end: formatDate(period.billing.end.dateValue),
      filter: {
        start: period.billing.start.dateValue,
        end: period.billing.end.dateValue,
      },
    };

    if (status === PAYMENT_STATUS.PENDING) {
      billing = {
        period: previous.period.key,
        start: formatDate(previous.billing.start.dateValue),
        end: formatDate(previous.billing.end.dateValue),
        filter: {
          start: previous.billing.start.dateValue,
          end: previous.billing.end.dateValue,
        },
      };
    }

    // Return the PaymentStatus object
    return {
      cutDate: formatDate(cutDate),
      dueDate: formatDate(dueDate),
      payment,
      status,
      total: total.toFixed(2),
      billing,
    };
  } catch (error) {
    console.log(error);
    return EMPTY_PAYMENT_STATUS;
  }
};

/**
 * Calculates the status of a credit card based on the provided date, payment history, and cut-off day.
 * @param date The current date for which the credit card status is to be calculated.
 * @param payments An array of CreditcardPayment objects representing payment history.
 * @param cutday The day of the month when the credit card bill is cut.
 * @returns An object containing the credit card status information including cut-off date, due date, billing period, status, and total payment.
 */
export const getCreditCardStatus2 = (
  date: Date,
  payments: CreditcardPayment[],
  cutday: number
): PaymentStatus => {
  const payData = createPaymentMap(payments);
  const paymentDates = Object.values(payData).map((x) => x.date);

  // 1: Gets credit card cut day based on a current day
  const cutDate = new Date(date.getFullYear(), date.getMonth(), cutday);
  if (cutDate > date) {
    cutDate.setMonth(cutDate.getMonth() - 1);
  }

  // 2: Gets the billing period
  const startDate = new Date(
    cutDate.getFullYear(),
    cutDate.getMonth(),
    cutday + 1
  );
  startDate.setMonth(startDate.getMonth() - 1);
  const billingPeriod = [startDate, cutDate];
  const periodName = getPeriodName(startDate);

  // 3: Calculates the due date
  const dueDate = new Date(startDate.getTime());
  dueDate.setDate(startDate.getDate() + 50);

  // 4: Check if the credit card is paid
  let total = 0;
  for (let index = 0; index < paymentDates.length; index++) {
    const pDate = paymentDates[index];
    if (pDate > cutDate && pDate <= dueDate)
      total += payData[pDate.toString()].total;
  }
  const hasPayment = total > 0;

  // 4: Get the credit card payment status
  let status = PAYMENT_STATUS.UNDEFINED;
  if (date > cutDate && date > dueDate && !hasPayment) {
    status = PAYMENT_STATUS.OVERDUE;
  } else if (date > cutDate && date > dueDate && hasPayment) {
    status = PAYMENT_STATUS.NOT_REQUIRED;
  } else if (date > cutDate && date <= dueDate && hasPayment) {
    status = PAYMENT_STATUS.PAID;
  } else {
    status = PAYMENT_STATUS.PENDING;
  }

  //Payment
  const endDate = new Date(billingPeriod[0].getTime());
  endDate.setDate(endDate.getDate() + 50);

  let labelCutdate = cutDate;
  if (status === PAYMENT_STATUS.PAID || cutday >= 15)
    labelCutdate = new Date(
      cutDate.getFullYear(),
      cutDate.getMonth() + 1,
      cutday
    );

  return {
    cutDate: formatDate(labelCutdate),
    dueDate: formatDate(dueDate),
    payment: {
      startDate: billingPeriod[0],
      dueDate: endDate,
    },
    billing: {
      filter: getDateRange(billingPeriod, status),
      period: periodName,
      start: formatDate(billingPeriod[0]),
      end: formatDate(billingPeriod[1]),
    },
    status,
    total: formatMoney(total),
  };
};

export const getDateRange = (
  billingPeriod: Date[],
  status: PAYMENT_STATUS
): { start: Date; end: Date } => {
  const now = new Date();
  let start = billingPeriod[0];
  let end = billingPeriod[1];
  const month = start.getMonth();
  if (
    status === PAYMENT_STATUS.PAID ||
    status === PAYMENT_STATUS.NOT_REQUIRED
  ) {
    start = new Date(now.getFullYear(), month + 1, start.getDate());
    end = new Date(now.getFullYear(), month + 2, end.getDate());
  }
  return { start, end };
};

/**
 * Filters a credit card based on a value, checking if the value is part of the wallet's or banking entity's name.
 * The comparison is case-insensitive.
 *
 * @param value The string value to filter by. If empty, the function returns true.
 * @param wallet The wallet object containing the wallet's name.
 * @param banking The financing entity object containing the banking entity's name.
 * @returns True if the value is found within the wallet's or banking entity's name, otherwise false.
 */
export const filterCard = (
  value: string,
  wallet: Wallet,
  banking: FinancingEntity
): boolean => {
  if (value.length > 0) {
    const query = value.toUpperCase();
    const walletName = wallet.name.toUpperCase();
    const bankingName = banking.name.toUpperCase();
    return walletName.includes(query) || bankingName.includes(query);
  } else {
    return true;
  }
};

/**
 * Creates a filter object for querying the card list based on the provided criteria.
 *
 * @param {any} entityId - The entity ID to filter by.
 * @param {any} isCreditCard - Indicates whether to filter by credit card (1) or debit card (0).
 * @param {any} active - Indicates whether to filter by active status (1 for active, 0 for inactive).
 * @returns {CardListFilter} The filter object to be used in the query.
 */
export const getCardListFilter = (
  entityId: any,
  isCreditCard: any,
  active: any
): CardListFilter => {
  const where: any = {};
  if (entityId) {
    where.entityId = entityId;
  }
  if (isCreditCard) {
    where.isCreditCard = isCreditCard;
  }
  if (active) {
    where.active = active;
  }
  return where;
};

const createPaymentMap = (payments: CreditcardPayment[]) => {
  return payments.reduce((acc: PaymentMap, payment: CreditcardPayment) => {
    const paymentDate = parseDate(payment.paymentDate);
    const key = paymentDate.toString();
    acc[key] = { date: paymentDate, total: payment.paymentTotal };
    return acc;
  }, {});
};

export const getPayments = (
  creditcardId: number
): Promise<CreditcardPayment[]> => {
  const options: any = {
    order: {
      paymentDate: "DESC",
    },
    take: 5,
    where: [{ creditcardId: creditcardId }],
  };
  return AppDataSource.manager.find(CreditcardPayment, options);
};

export const getInstallments = async (
  creditcard: Creditcard
): Promise<CreditCardSummaryInstallmentTotal | undefined> => {
  const EMPTY_INSTALLMENT: CreditCardSummaryInstallmentTotal = {
    balance: formatMoney(0),
    monthlyPayment: formatMoney(0),
  };
  try {
    const creditcardId: number = creditcard.id;
    const cutDay: number = creditcard.cutDay;
    const installments: MonthlyNonInterest[] = await AppDataSource.manager.find(
      MonthlyNonInterest,
      { where: { creditcardId: creditcardId, archived: 0 } }
    );
    //
    // const expenses = await Promise.all(installments.map(async (x) => await x.expense));
    // console.log(expenses);
    //
    const ids = installments.map((x) => x.id);
    const monthlyInstallments: MonthlyInstallmentPayment[] =
      await AppDataSource.manager.find(MonthlyInstallmentPayment, {
        where: { id: In(ids) },
      });
    const hasBalance = monthlyInstallments.filter((x) => x.isPaid === 0);
    if (hasBalance.length > 0) {
      // Balance
      const balance = monthlyInstallments
        .filter((x) => x.isPaid === 0)
        .map((x) => x.value)
        .reduce((pV, cV) => pV + cV);
      // Calculate Monthly Payments
      const classifiedPayments = classifyMonthlyPayments(
        monthlyInstallments,
        cutDay
      );
      const monthlyPayment = getCurrentMonthlyPayment(classifiedPayments);
      //Format the installment summary
      const installment: CreditCardSummaryInstallmentTotal = {
        balance: formatMoney(balance),
        monthlyPayment: formatMoney(monthlyPayment),
      };
      return installment;
    }
  } catch (error) {
    console.log(error);
  }
  return EMPTY_INSTALLMENT;
};

/**
 * Generates an array of CreditCardPeriod objects for each month of the specified year, based on the given cut day.
 *
 * @param {number} cutDay - The day of the month used as the cut-off date for each period.
 * @param {number} year - The year for which the periods will be generated.
 * @returns {CreditCardPeriod[]} An array of CreditCardPeriod objects, one for each month from January to December.
 *
 * The CreditCardPeriod contains:
 * - `period`: The month and year, with a `key` formatted as `${monthName} ${year}`.
 * - `cutDay`: The specified cut-off day as a string.
 * - `cutDate`: The date for the cut day of the current month, formatted as an object with `dateValue` and `dateString`.
 * - `billing`: The start and end dates for the billing period, based on the cut day and length of the month.
 * - `dueDate`: The payment due date, calculated as 20 days after the cut date.
 */
export const generateCreditCardPeriods = (
  cutDay: number,
  year: number,
  daysToPay: number = 20
): CreditCardPeriod[] => {
  const periods: CreditCardPeriod[] = [];

  // Add the December period for the previous year
  periods.push(createPeriod(cutDay, 11, year - 1, daysToPay));

  // Add periods for the current year (January to December)
  for (let month = 0; month < 12; month++) {
    periods.push(createPeriod(cutDay, month, year, daysToPay));
  }

  // Adds January for the next year
  periods.push(createPeriod(cutDay, 0, year + 1, daysToPay));

  return periods;
};

export const groupSpending = (data: CardSpending[]): CardSpending[] => {
  const groupedData = new Map<string, CardSpending>();

  data.forEach((item) => {
    const key = `${item.label}-${item.period}-${item.cutDate}`;

    if (groupedData.has(key)) {
      // If the key already exists, accumulate the spending
      groupedData.get(key)!.spending += item.spending;
    } else {
      // Otherwise, add the item to the map
      groupedData.set(key, { ...item });
    }
  });

  // Convert the map values back to an array
  return Array.from(groupedData.values());
};

export const createPeriod = (
  cutDay: number,
  month: number,
  year: number,
  daysToPay: number
): CreditCardPeriod => {
  const cutDate = new Date(year, month, cutDay);
  const cutDateString = formatDate(cutDate);
  const monthName = getMonthName(cutDate);
  const periodKey = `${monthName} ${year}`;

  // Calculate billing start and end dates
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousMonthYear = month === 0 ? year - 1 : year;
  const billingStartDate = new Date(
    previousMonthYear,
    previousMonth,
    cutDay + 1
  );
  const billingEndDate = new Date(year, month, cutDay);

  // Format billing dates
  const billingStartString = formatDate(billingStartDate);
  const billingEndString = formatDate(billingEndDate);

  // Calculate due date (20 days after billing end)
  const dueDate = new Date(billingEndDate);
  dueDate.setDate(dueDate.getDate() + daysToPay);
  const adjustedDueDate = adjustDueDate(dueDate);
  const dueDateString = formatDate(adjustedDueDate);

  return {
    period: {
      month: month + 1,
      year,
      key: periodKey,
    },
    cutDay: cutDay.toString(),
    cutDate: {
      dateValue: cutDate,
      dateString: cutDateString,
    },
    billing: {
      start: {
        dateValue: billingStartDate,
        dateString: billingStartString,
      },
      end: {
        dateValue: billingEndDate,
        dateString: billingEndString,
      },
    },
    dueDate: {
      dateValue: adjustedDueDate,
      dateString: dueDateString,
    },
  };
};
