export const formatCalendarMonth = (isoMonth: string): string => {
  // Handles format YYYY-MM and returns Month YYYY (e.g., "2025-04" -> "April 2025")
  if (!isoMonth.includes('-')) return isoMonth;
  
  const [year, month] = isoMonth.split('-');
  // Note: Month is 0-indexed in Date constructor
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getMonthAbbreviation = (isoMonth: string): string => {
  const formatted = formatCalendarMonth(isoMonth);
  return formatted.split(' ')[0].substring(0, 3);
};