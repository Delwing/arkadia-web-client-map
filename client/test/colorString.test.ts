import { colorString } from '../src/Colors';

describe('colorString', () => {
  test('returns input when substring missing', () => {
    const input = 'some text';
    expect(colorString(input, 'missing', 1)).toBe(input);
  });
});
