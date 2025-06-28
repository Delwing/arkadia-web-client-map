import initKillTrigger from '../src/scripts/kill';
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
