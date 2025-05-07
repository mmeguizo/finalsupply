export const formatCategory = (value: string) => {
  if (!value) return "";
  return value
    .split(" ") // Split by spaces
    .map((word) => word.charAt(0).toUpperCase()) // Get first letter and capitalize
    .join(""); // Join the initials
};

export const currencyFormat = (value: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
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