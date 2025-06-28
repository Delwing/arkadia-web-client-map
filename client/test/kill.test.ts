import initKillTrigger from '../src/scripts/kill';
import Triggers from '../src/Triggers';

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
});
