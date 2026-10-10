import { DateRange } from '@expense/types/expensesTypes';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const getMonthName = (date: Date) => {
  const monthNames = MONTH_NAMES;

  const monthIndex = date.getMonth();
  return monthNames[monthIndex];
};

export const getWeekOfMonth = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  let dayOfWeekStarting = start.getDay() - 1; // Adjust so that Monday is 0
  if (dayOfWeekStarting === -1) dayOfWeekStarting = 6; // Sunday becomes 6
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + dayOfWeekStarting) / 7);
};

export const getDateRange = (
  cutDate: Date,
  cutDay: number,
  status: string
): DateRange => {
  const now = new Date();
  let start: Date;
  let end: Date;
  let month = now.getMonth();
  if (cutDate !== new Date(now.getFullYear(), month, cutDay + 1)) {
    month = cutDate.getMonth();
    if (cutDay > 15) month++;
  }
  if (status === 'Pending') {
    start = new Date(now.getFullYear(), month - 1, cutDay + 1);
    end = new Date(now.getFullYear(), month, cutDay);
  } else if (status === 'Not required') {
    start = new Date(now.getFullYear(), month + 1, cutDay + 1);
    end = new Date(now.getFullYear(), month + 2, cutDay);
  } else {
    if (cutDay < 15) {
      month = now.getMonth();
    }
    start = new Date(now.getFullYear(), month, cutDay + 1);
    end = new Date(now.getFullYear(), month + 1, cutDay);
  }

  return { start, end };
};

export const isValidDate = (date: any) => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const getCurrentMonthYear = (): string => {
  const today = new Date();
  const currentMonth = getMonthName(today);
  const currentYear = today.getFullYear().toString();

  // Get the formatted key for this month
  const currentMonthKey = `${currentMonth} ${currentYear}`;
  return currentMonthKey;
};

/**
 * Converts a date serialized by the API (a calendar date at UTC midnight)
 * into the same calendar date at local midnight, so it is not shifted to the
 * previous day in timezones behind UTC.
 */
export const toLocalCalendarDate = (value: Date | string): Date => {
  const date = new Date(value);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const getCutDate = (year: number, month: number, cutDay: number): Date => {
  // Clamp the cut day to the last day of the month (e.g. 31 -> Feb 28)
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(cutDay, lastDay));
};

export interface CardPeriodsResult {
  periods: Map<string, DateRange>;
  currentKey: string;
}

/**
 * Generates the billing periods around the given one. Each period runs from
 * the day after the previous cut date to the cut date (both inclusive).
 */
export const generateCardPeriods = (period: DateRange): CardPeriodsResult => {
  const { end } = period;
  const cutDay = end.getDate();

  // The cut day (end's day-of-month) is fixed for a card, so it alone
  // decides whether a period is labeled by its start or end month.
  const useEndMonth = cutDay >= 15;

  const periods = new Map<string, DateRange>();
  let currentKey = '';

  for (let offset = -12; offset <= 5; offset++) {
    const month = end.getMonth() + offset;
    const newEnd = getCutDate(end.getFullYear(), month, cutDay);
    const previousCut = getCutDate(end.getFullYear(), month - 1, cutDay);
    const newStart = new Date(
      previousCut.getFullYear(),
      previousCut.getMonth(),
      previousCut.getDate() + 1
    );
    const keyDate = useEndMonth ? newEnd : newStart;
    const key = `${getMonthName(keyDate)} ${keyDate.getFullYear()}`;
    if (offset === 0) currentKey = key;
    periods.set(key, { start: newStart, end: newEnd });
  }

  return { periods, currentKey };
};

export const formatShortMonthYear = (dateStr: string): string => {
  const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleString('en', { month: 'short' });
  return `${month} ${date.getFullYear()}`;
};

const FULL_MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const sliceByMonthRange = (
  labels: string[],
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number
): { startIndex: number; endIndex: number } => {
  const fromLabel = `${FULL_MONTH_NAMES[fromMonth - 1]} ${fromYear}`;
  const toLabel = `${FULL_MONTH_NAMES[toMonth - 1]} ${toYear}`;

  let startIndex = labels.findIndex((l) => l === fromLabel);
  let endIndex = labels.findIndex((l) => l === toLabel);

  if (startIndex === -1) startIndex = 0;
  if (endIndex === -1) endIndex = labels.length - 1;

  return { startIndex, endIndex: endIndex + 1 };
};

export const sliceMonthLabels = (
  sliceMonthLabels: string[]
): { startIndex: number; endIndex: number } => {
  const currentMonthStr = getCurrentMonthYear();
  const currentIndex = sliceMonthLabels.findIndex((m) => m === currentMonthStr);

  // 3. Define slice range (6 months before & after, or available)
  const startIndex = Math.max(0, currentIndex - 6);
  const endIndex = Math.min(sliceMonthLabels.length, currentIndex + 7); // +7 because slice is exclusive at the end

  return { startIndex, endIndex };
};
