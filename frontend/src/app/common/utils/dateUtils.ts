export const getWeekOfMonth = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  let dayOfWeekStarting = start.getDay() - 1; // Adjust so that Monday is 0
  if (dayOfWeekStarting === -1) dayOfWeekStarting = 6; // Sunday becomes 6
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + dayOfWeekStarting) / 7);
};

