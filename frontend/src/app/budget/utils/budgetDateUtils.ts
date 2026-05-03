export type WeekOption = {
  label: string;
  start: Date;
  end: Date;
};

export type MonthOption = {
  label: string;
  month: number; // 0-indexed
  start: Date;
  end: Date;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function toSqlDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns all Mon–Sun weeks that overlap with the given month. */
export function getWeeksOfMonth(year: number, month: number): WeekOption[] {
  const firstDay = new Date(year, month, 1);
  const dow = firstDay.getDay(); // 0 = Sunday
  const diffToMonday = dow === 0 ? -6 : 1 - dow;

  const cursor = new Date(year, month, 1 + diffToMonday);
  const weeks: WeekOption[] = [];
  let weekNum = 1;

  while (true) {
    const monday = new Date(cursor);
    const sunday = new Date(cursor);
    sunday.setDate(cursor.getDate() + 6);

    // Stop once Monday is past the end of the requested month
    if (monday.getFullYear() > year || monday.getMonth() > month) break;

    const startLabel = `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()].slice(0, 3)}`;
    const endLabel = `${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()].slice(0, 3)}`;

    weeks.push({
      label: `Week ${weekNum} (${startLabel} – ${endLabel})`,
      start: monday,
      end: sunday,
    });

    weekNum++;
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

/** Returns the index of the week that contains today, or 0. */
export function getCurrentWeekIndex(weeks: WeekOption[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const idx = weeks.findIndex((w) => today >= w.start && today <= w.end);
  return idx >= 0 ? idx : 0;
}

/** Returns all 12 months for the given year. */
export function getMonthsOfYear(year: number): MonthOption[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: MONTH_NAMES[i],
    month: i,
    start: new Date(year, i, 1),
    end: new Date(year, i + 1, 0),
  }));
}

/** Builds an array of years from minYear to maxYear inclusive. */
export function buildYearRange(minYear: number, maxYear: number): number[] {
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);
  return years;
}
