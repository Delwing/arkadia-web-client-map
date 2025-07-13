import { parseAnsiPatterns } from '../../web-client/src/ansiParser';

describe('parseAnsiPatterns', () => {
  test('reset with no previous color opens inherit span', () => {
    const result = parseAnsiPatterns('\x1b[0mfoo');
    expect(result).toBe('<span style="color: inherit">foo</span>');
  });
});
