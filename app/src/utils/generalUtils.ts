export const formatCategory = (value: string) => {
  if (!value) return "";
  return value
    .split(" ") // Split by spaces
    .map((word) => word.charAt(0).toUpperCase()) // Get first letter and capitalize
    .join(""); // Join the initials
};

export const currencyFormat = (value: number | string | null | undefined): string => {
  const numericValue = Number(value);

  if (isNaN(numericValue)) {
    // Handle cases where value is not a number, or null/undefined
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(0);
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(numericValue);
};

export const currencyFormatWithRoundingSymbol = (value: number) => {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "k";
  }
  return  value.toString();
  // return currencyFormat(value);
};


// ... existing utils ...

export const formatBarChartData = (data: any[]) => {
  const currentYear = new Date().getFullYear();
  
  return data?.reduce((acc, item) => {
    const date = new Date(parseInt(item.createdAt));
    if (date.getFullYear() === currentYear) {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const existingMonth = acc.find((x: any) => x.month === month);
      
      if (existingMonth) {
        existingMonth.amount += item.amount;
      } else {
        acc.push({ month, amount: item.amount });
      }
    }
    return acc;
  }, [])
  .sort((a : any, b : any) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  }) || [];
};

// add uppercase to first letter of each word
export const capitalizeFirstLetter = (str: string | undefined) => {
  return str?.replace(/\b\w/g, (match) => match.toUpperCase());
};


/**
 * Formats a Unix timestamp string (milliseconds) into a human-readable date and time string.
 *
 * @param {string | number} timestampString The Unix timestamp in milliseconds (as a string or number).
 * @returns {string} The formatted date string (e.g., "05/21/2025, 11:44:25 AM") or "Invalid Date" if parsing fails.
 */
export const formatTimestampToDateTime = (timestampString: string | number): string => {
  const timestamp = typeof timestampString === 'string'
    ? parseInt(timestampString, 10)
    : timestampString;

  // Check for NaN after parsing, and also if the timestamp is a valid number
  if (isNaN(timestamp) || typeof timestamp !== 'number') {
    return 'Invalid Date';
  }

  const date = new Date(timestamp);

  // Ensure the date object is valid before formatting
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-US', {
    year : 'numeric',
    month: 'long',
    day: 'numeric',
    // year: 'numeric',
    // month: '2-digit',
    // day: '2-digit',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // hour12: true, // Ensures AM/PM format
  });
};
export const formatTimestampToDateTimeForPrinting = (timestampString: string | number): string => {
  console.log('timestampString', timestampString);
  const timestamp = typeof timestampString === 'string'
    ? parseInt(timestampString, 10)
    : timestampString;

  // Check for NaN after parsing, and also if the timestamp is a valid number
  if (isNaN(timestamp) || typeof timestamp !== 'number') {
    return 'Invalid Date';
  }

  const date = new Date(timestamp);

  // Ensure the date object is valid before formatting
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-US', {
    year : 'numeric',
    month: '2-digit',
    day: 'numeric',
    // year: 'numeric',
    // month: '2-digit',
    // day: '2-digit',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // hour12: true, // Ensures AM/PM format
  });
};

/**
 * Formats a date string (e.g., "2025-07-30", "2025/07/30") into a human-readable date string.
 *
 * @param {string} dateString The date string in formats like "YYYY-MM-DD" or "YYYY/MM/DD".
 * @returns {string} The formatted date string (e.g., "July 30, 2025") or "Invalid Date" if parsing fails.
 */
export const formatDateString = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return 'Invalid Date';
  }

  const date = new Date(dateString);

  // Ensure the date object is valid before formatting
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


/**
 * Formats a numeric value as Philippine Peso currency with 2 decimal places.
 *
 * @param {any} value The numeric value to format (will be converted to number).
 * @returns {string} The formatted currency string (e.g., "₱1,234.56") or "₱0.00" if invalid.
 */
export const formatCurrencyPHP = (value: any): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2
  }).format(Number(value) || 0);
};