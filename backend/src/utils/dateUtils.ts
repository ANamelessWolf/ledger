import { DATE_FORMAT, EU_FORMAT, ISO_FORMAT, US_FORMAT } from "../common";

export const getMonthName = (date: Date) => {
  const monthNames = [
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

  const monthIndex = date.getMonth();
  return monthNames[monthIndex];
};

export const getPeriodName = (date: Date) => {
  return `${getMonthName(date)} ${date.getFullYear()}`;
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
