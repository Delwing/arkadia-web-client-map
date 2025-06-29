import initKillTrigger, { parseName, formatTable, formatSummary } from '../src/scripts/kill';
import Triggers, { stripAnsiCodes } from '../src/Triggers';

class FakeClient {
  eventTarget = new EventTarget();
  Triggers = new Triggers(({} as unknown) as any);
  TeamManager = { isInTeam: jest.fn() };
  prefix = (line: string, prefix: string) => prefix + line;
  print = jest.fn();
  port = { postMessage: jest.fn() } as any;

  addEventListener(event: string, cb: any) {
    this.eventTarget.addEventListener(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.eventTarget.removeEventListener(event, cb);
  }
  dispatch(event: string, detail: any) {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
  }
}

describe('kill counter team kills', () => {
  let client: FakeClient;

  beforeEach(() => {
    client = new FakeClient();
    initKillTrigger((client as unknown) as any, []);
    client.dispatch('storage', { key: 'kill_counter', value: {} });
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

  test('session count persists after storage update', () => {
    client.TeamManager.isInTeam.mockReturnValue(true);
    let result = parse('> Eamon zabil smoka chaosu.');
    expect(result).toContain('(0 / 1)');

    client.dispatch('storage', { key: 'kill_counter', value: { 'smoka chaosu': 1 } });

    result = parse('> Eamon zabil smoka chaosu.');
    expect(result).toContain('(0 / 2)');
  });
});

describe('kill counter scenario', () => {
  let client: FakeClient;
  let parse: (line: string) => string;
  let printTable: () => void;

  beforeEach(() => {
    const aliases: { pattern: RegExp; callback: () => void }[] = [];
    client = new FakeClient();
    initKillTrigger((client as unknown) as any, aliases);
    client.dispatch('storage', { key: 'kill_counter', value: {} });
    parse = (line: string) =>
      Triggers.prototype.parseLine.call(client.Triggers, line, '');
    printTable = aliases[0].callback;
  });

  test('player and team kills accumulate and print correctly', () => {
    parse('Zabiles smoka chaosu.');
    parse('Zabilas smoka chaosu.');
    client.TeamManager.isInTeam.mockReturnValue(true);
    parse('Eamon zabil smoka chaosu.');

    printTable();

    const printed = stripAnsiCodes(client.print.mock.calls[0][0]);
    expect(printed).toMatch(/smoka chaosu/);
    expect(printed).toMatch(/2 \/ 3/);
    expect(printed).toMatch(/LACZNIE:.*2/);
    expect(printed).toMatch(/DRUZYNA LACZNIE:.*3/);
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
    expect(table).toMatch(/troll .* 1/);
    expect(table).toMatch(/DRUZYNA LACZNIE/);
  });

  test('formatSummary prints header and sorts names', () => {
    const summary = formatSummary({
      Bbb: { mySession: 0, myTotal: 1, teamSession: 0 },
      Aaa: { mySession: 0, myTotal: 2, teamSession: 0 },
      goblin: { mySession: 0, myTotal: 1, teamSession: 0 },
    });
    const stripped = stripAnsiCodes(summary);
    expect(stripped).toMatch(/Licznik zabitych/);
    const indexAaa = stripped.indexOf('Aaa');
    const indexGoblin = stripped.indexOf('goblin');
    expect(indexAaa).toBeLessThan(indexGoblin);
  });
});
