import { PAYMENT_STATUS } from "../common/enums";
import { CreditcardPayment } from "../models/ledger";
import { CreditCardPeriod } from "../types/paymentStatus";
import { stripTime } from "./dateUtils";

export const findSurroundingPeriods = (
  date: Date,
  periods: CreditCardPeriod[]
): {
  previous: CreditCardPeriod;
  current: CreditCardPeriod;
  next: CreditCardPeriod;
} => {
  // Find the index of the current period where the date falls between billing start and end
  const currentIndex = periods.findIndex((period) => {
    const strippedDate = stripTime(date);
    const start = stripTime(period.billing.start.dateValue);
    const end = stripTime(period.billing.end.dateValue);

    return strippedDate >= start && strippedDate <= end;
  });
  // Define previous, current, and next periods based on the found index
  const previous = periods[currentIndex - 1];
  const current = periods[currentIndex];
  const next = periods[currentIndex + 1];

  return { previous, current, next };
};

export const findCreditCardPeriod = (
  periods: CreditCardPeriod[],
  paymentDate: Date
): CreditCardPeriod | undefined => {
  const strippedDate = stripTime(paymentDate);
  return periods.find(
    (period) =>
      strippedDate > stripTime(period.cutDate.dateValue) &&
      strippedDate <= stripTime(period.dueDate.dateValue)
  );
};

export const getPaymentStatus = (
  date: Date,
  previous: CreditCardPeriod,
  current: CreditCardPeriod,
  next: CreditCardPeriod,
  payments: CreditcardPayment[]
): {
  total: number;
  status: PAYMENT_STATUS;
} => {
  let total: number = 0;
  let status: PAYMENT_STATUS = PAYMENT_STATUS.UNDEFINED;
  const currentDate = stripTime(date);
  const cutDate = stripTime(previous.cutDate.dateValue);
  const dueDate = stripTime(previous.dueDate.dateValue);
  if (currentDate <= dueDate && currentDate > cutDate) {
    const payment = payments.filter((payment) =>
      isPaid(
        payment.paymentDate,
        previous.cutDate.dateValue,
        previous.dueDate.dateValue
      )
    );
    if (payment.length > 0) {
      status = PAYMENT_STATUS.PAID;
      total = payment[0].paymentTotal;
    } else {
      status = PAYMENT_STATUS.PENDING;
    }
  } else if (currentDate > dueDate) {
    const payment = payments.filter((payment) =>
      isPaid(
        payment.paymentDate,
        previous.cutDate.dateValue,
        previous.dueDate.dateValue
      )
    );
    if (payment.length > 0) {
      status = PAYMENT_STATUS.NOT_REQUIRED;
      total = payment[0].paymentTotal;
    } else {
      status = PAYMENT_STATUS.OVERDUE;
    }
  }
  return { total, status };
};

/**
 * Checks if a payment date falls between a start and end date.
 *
 * @param paymentDate - The date of the payment to check (in string format).
 * @param start - The start date (exclusive).
 * @param end - The end date (inclusive).
 * @returns boolean - Returns true if paymentDate is within the specified range; otherwise, false.
 */
export const isPaid = (
  paymentDate: string,
  startDate: Date,
  endDate: Date
): boolean => {
  const payment = new Date(paymentDate);
  return payment > startDate && payment <= endDate;
};
