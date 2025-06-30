import { color, colorString, findClosestColor } from '../src/Colors';

describe('colorString', () => {
  test('restores previous color after string', () => {
    const prevColor = findClosestColor('#555555');
    const newColor = findClosestColor('#ff0000');
    const rawLine = `${color(prevColor)}prefix Bob suffix`;
    const result = colorString(rawLine, 'Bob', newColor);
    expect(result).toBe(`${color(prevColor)}prefix ${color(newColor)}Bob${color(prevColor)} suffix`);
  });
});

