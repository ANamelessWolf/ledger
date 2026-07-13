import { DATE_FORMAT, EU_FORMAT, ISO_FORMAT, US_FORMAT } from "../common";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getMonthName = (date: Date) => {
  const monthNames = MONTH_NAMES;

  const monthIndex = date.getMonth();
  return monthNames[monthIndex];
};

export const formatMonthKey = (monthKey: string) => {
  const year = monthKey.substring(0, 4);
  const monthIndex = parseInt(monthKey.substring(4, 6), 10) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
};

export const getPeriodName = (date: Date) => {
  return `${getMonthName(date)} ${date.getFullYear()}`;
};

/**
 * Picks which side of a billing period (start month vs. end month) should
 * represent the period. A card's cut day is fixed, so this depends only on
 * the cut day itself (the end date's day-of-month) rather than the number of
 * days in any particular month — a card that cuts on the 15th or later is
 * labeled by its closing month; otherwise by the month the period started in.
 * @param start The billing period's start date.
 * @param end The billing period's end date (its day-of-month is the cut day).
 * @returns The date (start or end) whose month/year should label the period.
 */
export const getBillingPeriodLabelDate = (start: Date, end: Date): Date => {
  return end.getDate() >= 15 ? end : start;
};

export const getPeriodKey = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${month}/${year}`;
};

export const parseDate = (dateString: string): Date => {
  //Configure date format on constants.ts
  if (DATE_FORMAT === ISO_FORMAT && DATE_FORMAT.test(dateString)) {
    const [year, month, day] = dateString.split("-");
    return new Date(+year, +month - 1, +day);
  } else if (DATE_FORMAT === US_FORMAT && DATE_FORMAT.test(dateString)) {
    const [month, day, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  } else if (DATE_FORMAT === EU_FORMAT && DATE_FORMAT.test(dateString)) {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month}-${day}`);
  } else {
    throw new Error(`Unsupported date format '${dateString}'`);
  }
};

/**
 * Formats a date in the format "Month Day, Year".
 * @param date The date object to be formatted.
 * @returns A string representing the formatted date.
 */
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  // Format the date using Intl.DateTimeFormat
  const dateString = new Intl.DateTimeFormat("en-US", options).format(date);
  return dateString;
};

export const getPeriodLabel = (period: number) => {
  const monthIndex = +("" + period).substring(4) - 1;
  const year = ("" + period).substring(0, 4);
  const monthNames = MONTH_NAMES;
  return `${monthNames[monthIndex]} ${year}`;
};

export const adjustDueDate = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6) {
    // Saturday
    date.setDate(date.getDate() + 2); // Move to Monday
  } else if (dayOfWeek === 0) {
    // Sunday
    date.setDate(date.getDate() + 1); // Move to Monday
  }
  return date;
};

export const stripTime = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getCurrentMonthlyKey = (): string => {
  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  const currentYear = today.getFullYear().toString();

  // Get the formatted key for this month
  const currentMonthKey = `${currentYear}${currentMonth}`;
  return currentMonthKey;
};
