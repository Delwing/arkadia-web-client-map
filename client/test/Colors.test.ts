import { color, colorString, findClosestColor } from '../src/Colors';

describe('colorString', () => {
  test('restores previous color after string', () => {
    const prevColor = findClosestColor('#555555');
    const newColor = findClosestColor('#ff0000');
    const rawLine = `${color(prevColor)}prefix Bob suffix`;
    const result = colorString(rawLine, 'Bob', newColor);
    expect(result).toBe(`${color(prevColor)}prefix ${color(newColor)}Bob${color(prevColor)} suffix`);
  });

  test('keeps specified color when prefix lacks ansi codes', () => {
    const tableColor = findClosestColor('#949494');
    const highlight = findClosestColor('#aaaaaa');
    const line = ' |   1. Luleck                                    0/ 4/ 2        nieogr.      |';
    const colored = colorString(line, 'Luleck', highlight, tableColor);
    const message =
      color(tableColor) +
      colored +
      '\n o' +
      '============================================================================o';
    const ansiReg = /\x1B\[[0-9;]*m/g;
    let last = '';
    let match;
    while ((match = ansiReg.exec(message)) !== null) {
      last = match[0];
    }
    expect(last).toBe(color(tableColor));
  });
});
