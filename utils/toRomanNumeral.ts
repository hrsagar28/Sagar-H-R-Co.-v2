export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 3999) return String(num);
  const map: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [val, sym] of map) {
    while (num >= val) { out += sym; num -= val; }
  }
  return out;
}
