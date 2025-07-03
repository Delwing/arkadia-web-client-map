import TeamManager from '../src/TeamManager';
import Triggers from '../src/Triggers';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  Triggers = new Triggers({} as any);
  addEventListener(event: string, cb: any, _options?: any) {
    this.emitter.on(event, cb);
    return () => this.emitter.off(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.emitter.off(event, cb);
  }
  sendEvent(type: string, detail?: any) {
    this.emitter.emit(type, { detail });
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
    expect(manager.isInTeam('Pablo')).toBe(true);
  });

  test('removes member on leave message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Vesper', living: true, team: true },
    });
    client.Triggers.parseLine('Vesper porzuca twoja druzyne.', '');
    expect(manager.isInTeam('Vesper')).toBe(false);
  });

  test('clears team on clear message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Bob', living: true, team: true },
    });
    client.Triggers.parseLine('Nie jestes w zadnej druzynie.', '');
    expect(manager.getTeamMembers()).toEqual([]);
  });

  test('full sync message sets leader and members', () => {
    client.Triggers.parseLine('Druzyne prowadzi Vesper i oprocz ciebie sa w niej jeszcze: Pablo i Opeteh.', '');
    expect(manager.getLeader()).toBe('Vesper');
    const members = manager.getTeamMembers();
    expect(members).toEqual(expect.arrayContaining(['Vesper', 'Pablo', 'Opeteh']));
    expect(manager.isInTeam('Pablo')).toBe(true);
  });
});
