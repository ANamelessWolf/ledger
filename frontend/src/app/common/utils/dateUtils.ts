import { DateRange } from '@expense/types/expensesTypes';

export const getWeekOfMonth = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  let dayOfWeekStarting = start.getDay() - 1; // Adjust so that Monday is 0
  if (dayOfWeekStarting === -1) dayOfWeekStarting = 6; // Sunday becomes 6
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + dayOfWeekStarting) / 7);
};

export const getDateRange = (cutDay: number, status: string): DateRange => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (status === 'Pending') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, cutDay + 1);
    end = new Date(now.getFullYear(), now.getMonth(), cutDay);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), cutDay + 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, cutDay);
  }

  return { start, end };
};
