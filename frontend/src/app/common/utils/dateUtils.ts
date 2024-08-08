import { DateRange } from '@expense/types/expensesTypes';

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
    start = new Date(now.getFullYear(), month+1, cutDay + 1);
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
