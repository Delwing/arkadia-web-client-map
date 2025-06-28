import TeamManager from '../src/TeamManager';
import Triggers from '../src/Triggers';

class FakeClient {
  eventTarget = new EventTarget();
  Triggers = new Triggers({} as any);
  addEventListener(event: string, cb: any, options?: any) {
    this.eventTarget.addEventListener(event, cb, options);
    return () => this.eventTarget.removeEventListener(event, cb, options);
  }
  removeEventListener(event: string, cb: any) {
    this.eventTarget.removeEventListener(event, cb);
  }
  sendEvent(type: string, detail?: any) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

describe('TeamManager', () => {
  let client: FakeClient;
  let manager: TeamManager;

  beforeEach(() => {
    client = new FakeClient();
    manager = new TeamManager((client as unknown) as any);
  });

  test('adds member from gmcp objects', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Pablo', living: true, team: true },
    });
    expect(manager.is_in_team('Pablo')).toBe(true);
  });

  test('removes member on leave message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Vesper', living: true, team: true },
    });
    client.Triggers.parseLine('Vesper porzuca twoja druzyne.', '');
    expect(manager.is_in_team('Vesper')).toBe(false);
  });

  test('clears team on clear message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Bob', living: true, team: true },
    });
    client.Triggers.parseLine('Nie jestes w zadnej druzynie.', '');
    expect(manager.get_team_members()).toEqual([]);
  });

  test('full sync message sets leader and members', () => {
    client.Triggers.parseLine('Druzyne prowadzi Vesper i oprocz ciebie sa w niej jeszcze: Pablo i Opeteh.', '');
    expect(manager.get_leader()).toBe('Vesper');
    const members = manager.get_team_members();
    expect(members).toEqual(expect.arrayContaining(['Vesper', 'Pablo', 'Opeteh']));
    expect(manager.is_in_team('Pablo')).toBe(true);
  });
});
