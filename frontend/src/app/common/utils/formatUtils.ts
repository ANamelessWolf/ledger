import { APP_SETTINGS } from '@config/constants';

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
