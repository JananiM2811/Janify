export const CURRENCY_SYMBOL = '₹';

// Formats an amount as Indian Rupees, e.g. 1250.5 -> "₹1,250.50", 60 -> "₹60"
export const formatPrice = (value) => {
  const amount = Number(value) || 0;
  const hasPaise = Math.round(amount * 100) % 100 !== 0;
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};
