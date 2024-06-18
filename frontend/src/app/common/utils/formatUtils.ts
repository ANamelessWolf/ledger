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
