export default function toRomanNumerals(n: number): string {
  let result = '';
  if (n < 1) {
    throw new Error('Number must be greater than 0');
  } else if (n > 3999) {
    const oldN = n;
    while (n > 3999) {
      n -= 4000;
    }
    if (n > 0) {
      result = `${oldN % 4000}.${toRomanNumerals(n)}`;
      return result;
    }
  }
  const roman = [
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
    ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'],
    ['', 'M', 'MM', 'MMM'],
  ];
  const digits = n.toString().split('').reverse();
  for (let i = 0; i < digits.length; i++) {
    result = roman[i][parseInt(digits[i])] + result;
  }
  return result;
}
