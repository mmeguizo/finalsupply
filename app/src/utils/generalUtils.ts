export const formatCategory = (value: string) => {
  if (!value) return "";
  return value
    .split(" ") // Split by spaces
    .map((word) => word.charAt(0).toUpperCase()) // Get first letter and capitalize
    .join(""); // Join the initials
};
