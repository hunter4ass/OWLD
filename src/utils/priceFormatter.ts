export const formatPrice = (price: number): string => {
  return `${price} ₽`;
};

export const formatPriceWithDecimals = (price: number): string => {
  return `${price.toFixed(2)} ₽`;
}; 