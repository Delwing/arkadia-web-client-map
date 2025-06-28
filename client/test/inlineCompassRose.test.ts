import InlineCompassRose from '../src/scripts/inlineCompassRose';

class FakeClient {
  addEventListener() {}
  removeEventListener() {}
  println = jest.fn();
}

describe('InlineCompassRose parsing', () => {
  const client = new FakeClient();
  const rose = new InlineCompassRose((client as unknown) as any);
  const parse = (detail: any) => (rose as any).parseExits(detail);
  const toShort = (exit: string) => (rose as any).toShort(exit);

  test('parseExits accepts various formats', () => {
    expect(parse(['north', 'south'])).toEqual(['n', 's']);
    expect(parse({ exits: ['east', 'west'] })).toEqual(['e', 'w']);
    expect(parse({ exits: { north: 1, south: 2 } })).toEqual(['n', 's']);
    expect(parse({ room: { exits: { up: 3 } } })).toEqual(['u']);
  });

  test('toShort converts directions', () => {
    expect(toShort('polnoc')).toBe('n');
    expect(toShort('south')).toBe('s');
    expect(toShort('north')).toBe('n');
    expect(toShort('unknown')).toBe('');
  });
});
