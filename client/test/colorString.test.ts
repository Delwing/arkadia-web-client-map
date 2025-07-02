import { colorStringInLine } from '../src/Colors';

describe('colorString', () => {
  test('returns input when substring missing', () => {
    const input = 'some text';
    expect(colorStringInLine(input, 'missing', 1)).toBe(input);
  });
});
