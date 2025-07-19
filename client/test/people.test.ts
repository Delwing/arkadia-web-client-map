import People from '../src/People';
import Triggers, { stripAnsiCodes } from '../src/Triggers';
import { color, RESET, findClosestColor } from '../src/Colors';

jest.mock('../src/people.json', () => [
  { name: 'Eamon', description: 'wysoki mezczyzna', guild: 'CKN' },
  { name: 'Eamon', description: 'wysoki mezczyzna w kapturze', guild: 'CKN' },
  { name: 'Krasn', description: 'krepy lysy krasnolud', guild: 'CKN' },
  { name: 'Mara', description: 'niska kobieta', guild: 'NPC' },
  { name: 'w', description: 'koscisty mezczyzna', guild: 'GP' }
], { virtual: true });

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  addEventListener = jest.fn();
}

describe('people triggers enemy highlight', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    new People((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    const handler = client.addEventListener.mock.calls[0]?.[1];
    if (handler) {
      handler({ detail: { guilds: [], enemyGuilds: ['CKN'] } } as any);
    }
  });

  test('colors enemy description red', () => {
    const result = parse('Widzisz wysoki mezczyzna tutaj.');
    const red = findClosestColor('#ff0000');
    const highlight = color(red);
    expect(result.split(highlight).length - 1).toBe(2);
    expect(result).toContain(color(red) + '(Eamon CKN)' + RESET);
    expect(stripAnsiCodes(result)).toContain('(Eamon CKN)');
  });

  test('colors enemy name red without suffix', () => {
    const result = parse('Eamon wita cie.');
    const red = findClosestColor('#ff0000');
    expect(result).toContain(color(red) + 'Eamon' + RESET);
    expect(stripAnsiCodes(result)).not.toContain('(Eamon CKN)');
  });

  test('enemy name is highlighted only once despite duplicates', () => {
    const result = parse('Eamon wita cie.');
    const red = findClosestColor('#ff0000');
    const highlight = color(red) + 'Eamon' + RESET;
    const parts = result.split(highlight);
    expect(parts.length - 1).toBe(1);
  });

  test('ignores very short enemy names to avoid false positives', () => {
    const result = parse('spotykasz w drodze przyjaciela.');
    const red = findClosestColor('#ff0000');
    expect(result).not.toContain(color(red));
  });

  test("doesn't color description when followed by chaosu", () => {
    const result = parse('Widzisz krepy lysy krasnolud chaosu tutaj.');
    const red = findClosestColor('#ff0000');
    expect(result).not.toContain(color(red));
    expect(stripAnsiCodes(result)).not.toContain('(Krasn CKN)');
  });
});

describe('people triggers guild highlight', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    new People((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    const handler = client.addEventListener.mock.calls[0]?.[1];
    if (handler) {
      handler({ detail: { guilds: ['CKN'], enemyGuilds: [] } } as any);
    }
  });

  test('adds name after description without red color', () => {
    const result = parse('Widzisz wysoki mezczyzna tutaj.');
    const red = findClosestColor('#ff0000');
    expect(result).not.toContain(color(red));
    expect(stripAnsiCodes(result)).toContain('(Eamon CKN)');
  });
});
