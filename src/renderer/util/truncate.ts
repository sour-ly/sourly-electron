const truncateNumber = (num: number, digits: number) => {
  const numStr = num.toString();
  const dotIndex = numStr.indexOf('.');
  if (dotIndex === -1) {
    return numStr;
  }
  return numStr.slice(0, dotIndex + digits + 1);
}

const truncateDecimal = (num: number, decimalPlaces: number) => {
  return Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

export { truncateDecimal };
export default truncateNumber;
