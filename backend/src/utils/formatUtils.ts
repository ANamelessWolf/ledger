/**
 * Formats a double value as money with two decimal places and an optional currency character.
 * @param value The value to be formatted as money.
 * @param currency Optional currency character. Defaults to '$'.
 * @returns A string representing the formatted money value.
 */
export const formatMoney = (value: number, currency: string = "$"): string => {
  const roundedValue = Math.round(value * 100) / 100;
  const formattedValue = roundedValue.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formattedValue}`;
};

/**
 * Formats a double value as percentage with two decimal
 * @param value The value to be formatted as money.
 * @param currency Optional currency character. Defaults to '$'.
 * @returns A string representing the formatted money value.
 */
export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)} %`;
};
