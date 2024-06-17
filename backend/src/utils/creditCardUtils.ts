import { AppDataSource } from "..";
import { PaymentMap } from "../common";
import { PAYMENT_STATUS } from "../common/enums";
import { FinancingEntity } from "../models/banking";
import { CreditcardPayment, Wallet } from "../models/ledger";
import { CardListFilter } from "../types/filter/cardListFilter";
import { PaymentStatus } from "../types/paymentStatus";
import { formatDate, getPeriodName, parseDate } from "./dateUtils";
import { formatMoney } from "./formatUtils";

/**
 * Calculates the status of a credit card based on the provided date, payment history, and cut-off day.
 * @param date The current date for which the credit card status is to be calculated.
 * @param payments An array of CreditcardPayment objects representing payment history.
 * @param cutday The day of the month when the credit card bill is cut.
 * @returns An object containing the credit card status information including cut-off date, due date, billing period, status, and total payment.
 */
export const getCreditCardStatus = (
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

  return {
    cutDate: formatDate(cutDate),
    dueDate: formatDate(dueDate),
    billing: {
      period: periodName,
      start: formatDate(billingPeriod[0]),
      end: formatDate(billingPeriod[1]),
    },
    status,
    total: formatMoney(total),
  };
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
