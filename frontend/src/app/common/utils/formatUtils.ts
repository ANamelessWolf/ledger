import { CatalogItem } from '@common/types/catalogTypes';
import { APP_SETTINGS } from '@config/constants';
import { SHORT_MONTH_NAME } from '@config/messages';

export const round = (numberValue: number) => {
  return +(Math.round(numberValue * 100) / 100).toFixed(2);
};

export const toNumber = (currency: string) => {
  if (currency) {
    const numericString = currency.substring(1).replaceAll(',', '');
    const numberValue = parseFloat(numericString);
    // Check if the result is a valid number
    if (isNaN(numberValue)) {
      throw new Error(`Invalid currency format: ${currency}`);
    }
    return numberValue;
  } else {
    return 0;
  }
};

export const toRequestFormat = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toCurrency = (value: number): string => {
  return new Intl.NumberFormat(APP_SETTINGS.APP_LOCAL, {
    style: 'currency',
    currency: APP_SETTINGS.CURRENCY,
  }).format(value);
};

export const toIds = (items: CatalogItem[] | undefined): number[] => {
  const ids: number[] = items ? (items as CatalogItem[]).map((x) => x.id) : [];
  return ids;
};

export const toShortDate = (date: Date): string => {
  const monthIndex = date.getMonth();
  const monthName = SHORT_MONTH_NAME[monthIndex];
  return `${monthName} ${date.getDate()} ${date.getFullYear()}`;
};

export const getDaysOfMonth = (date: Date): number[] => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  // Calculate the offset based on the first day of the month
  const offset = (firstDay + 6) % 7;
  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create an array with the appropriate number of zeros based on the offset
  const daysArray = new Array(offset).fill(0);

  // Append the days of the month to the array
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  return daysArray;
};
