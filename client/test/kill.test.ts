import initKillTrigger, { parseName, formatTable } from '../src/scripts/kill';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  TeamManager = { isInTeam: jest.fn() };
  prefix = (line: string, prefix: string) => prefix + line;
  print = jest.fn();
}

describe('kill counter team kills', () => {
  let client: FakeClient;

  beforeEach(() => {
    (global as any).chrome = {
      storage: { local: { get: jest.fn(() => Promise.resolve({})), set: jest.fn() } },
    };
    client = new FakeClient();
    initKillTrigger((client as unknown) as any, []);
  });

  const parse = (line: string) => {
    return Triggers.prototype.parseLine.call(client.Triggers, line, '');
  };

  test('ignores kills from outside the team', () => {
    client.TeamManager.isInTeam.mockReturnValue(false);
    const line = '> Eamon zabil smoka chaosu.';
    let result = parse(line);
    expect(result).toContain('[   ZABIL   ]');
    expect(result).not.toContain('(');

    client.TeamManager.isInTeam.mockReturnValue(true);
    result = parse(line);
    expect(result).toContain('(0 / 1)');
  });

  test('counts kills from team members', () => {
    client.TeamManager.isInTeam.mockReturnValue(true);
    const line = '> Eamon zabil smoka chaosu.';
    const result = parse(line);
    expect(result).toContain('[   ZABIL   ]');
    expect(result).toContain('(0 / 1)');
  });
});

describe('parseName and formatTable', () => {
  test('parseName returns expected values', () => {
    expect(parseName('Troll')).toBe('Troll');
    expect(parseName('smoka chaosu')).toBe('smoka chaosu');
    expect(parseName('Wielki Troll')).toBe('troll');
  });

  test('formatTable prints table with totals', () => {
    const table = formatTable({
      troll: { mySession: 1, myTotal: 1, teamSession: 0 },
      smok: { mySession: 0, myTotal: 0, teamSession: 2 },
    });
    expect(table).toMatch(/Licznik zabitych/);
    expect(table).toMatch(/troll/);
    expect(table).toMatch(/1 \/ 1/);
    expect(table).toMatch(/DRUZYNA LACZNIE/);
  });
});
