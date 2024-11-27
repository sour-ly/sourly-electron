export default function toRomanNumerals(n: number): string {
  if (n < 1 || n > 3999) {
    throw new Error('Number out of range');
  }
  const roman = [
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
    ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'],
    ['', 'M', 'MM', 'MMM'],
  ];
  const digits = n.toString().split('').reverse();
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    result = roman[i][parseInt(digits[i])] + result;
  }
  return result;
}
