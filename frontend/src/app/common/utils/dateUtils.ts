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
