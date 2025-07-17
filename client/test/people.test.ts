import People from '../src/People';
import Triggers, { stripAnsiCodes } from '../src/Triggers';
import { color, RESET, findClosestColor } from '../src/Colors';

jest.mock('../src/people.json', () => [
  { name: 'Eamon', description: 'wysoki mezczyzna', guild: 'CKN' },
  { name: 'Eamon', description: 'wysoki mezczyzna w kapturze', guild: 'CKN' },
  { name: 'Mara', description: 'niska kobieta', guild: 'NPC' }
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
    expect(result).toContain(color(red));
    expect(stripAnsiCodes(result)).toContain('(Eamon CKN)');
  });

  test('colors enemy name red', () => {
    const result = parse('Eamon wita cie.');
    const red = findClosestColor('#ff0000');
    expect(result).toContain(color(red) + 'Eamon' + RESET);
  });

  test('enemy name suffix appears only once', () => {
    const result = parse('Eamon wita cie.');
    const matches = stripAnsiCodes(result).match(/\(Eamon CKN\)/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
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
