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
    client.sendEvent('gmcp.char.info', { object_num: '99' });
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

  test('emits event when leader attacks different target', () => {
    const callback = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', callback);
    client.sendEvent('gmcp.objects.data', {
      '1': {
        desc: 'Eamon',
        living: true,
        team: true,
        team_leader: true,
        attack_num: '3',
      },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('emits event when leader attacks and avatar does not', () => {
    const callback = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', callback);
    client.sendEvent('gmcp.objects.data', {
      '1': {
        desc: 'Eamon',
        living: true,
        team: true,
        team_leader: true,
        attack_num: '3',
      },
      '99': { desc: 'You', living: true, team: true, attack_num: false },
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('does not emit event when targets match', () => {
    const noAvatar = jest.fn();
    const avatar = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', noAvatar);
    client.addEventListener('teamLeaderTargetAvatar', avatar);
    client.sendEvent('gmcp.objects.data', {
      '1': {
        desc: 'Eamon',
        living: true,
        team: true,
        team_leader: true,
        attack_num: '2',
      },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    expect(noAvatar).not.toHaveBeenCalled();
    expect(avatar).toHaveBeenCalledTimes(1);
  });

  test('emits event on each gmcp update while mismatch persists', () => {
    const callback = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', callback);
    const data = {
      desc: 'Eamon',
      living: true,
      team: true,
      team_leader: true,
      attack_num: '3',
    };
    const player = { desc: 'You', living: true, team: true, attack_num: '2' };
    client.sendEvent('gmcp.objects.data', { '1': data, '99': player });
    client.sendEvent('gmcp.objects.data', { '1': data, '99': player });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('emits event again after target changes', () => {
    const callback = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', callback);
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Eamon', living: true, team: true, team_leader: true, attack_num: '3' },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Eamon', living: true, team: true, team_leader: true, attack_num: '2' },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Eamon', living: true, team: true, team_leader: true, attack_num: '3' },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('emits event again when leader number changes', () => {
    const callback = jest.fn();
    client.addEventListener('teamLeaderTargetNoAvatar', callback);
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Eamon', living: true, team: true, team_leader: true, attack_num: '3' },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    client.sendEvent('gmcp.objects.data', {
      '2': { desc: 'Eamon', living: true, team: true, team_leader: true, attack_num: '3' },
      '99': { desc: 'You', living: true, team: true, attack_num: '2' },
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('stores attack and defense target ids', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Bob', living: true, team: true, attack_target: true },
      '2': { desc: 'Alice', living: true, team: true, defense_target: true },
    });
    expect(manager.getAttackTargetId()).toBe('1');
    expect(manager.getDefenseTargetId()).toBe('2');
  });

});
