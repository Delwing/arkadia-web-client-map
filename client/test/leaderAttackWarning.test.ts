import initLeaderAttackWarning from '../src/scripts/leaderAttackWarning';
import { stripAnsiCodes } from '../src/Triggers';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  TeamManager = {
    getAttackTargetId: jest.fn(),
    getLeader: jest.fn(),
    getAccumulatedObjectsData: jest.fn()
  };
  println = jest.fn();
  addEventListener(event: string, cb: any) {
    this.emitter.on(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.emitter.off(event, cb);
  }
  sendEvent(type: string, detail?: any) {
    this.emitter.emit(type, { detail });
  }
}

describe('leader attack warning', () => {
  let client: FakeClient;

  beforeEach(() => {
    client = new FakeClient();
    initLeaderAttackWarning((client as unknown) as any);
  });

  test('prints warning when targets differ', () => {
    client.TeamManager.getAttackTargetId.mockReturnValue('2');
    client.TeamManager.getLeader.mockReturnValue('Leader');
    client.TeamManager.getAccumulatedObjectsData.mockReturnValue({ '10': { desc: 'Leader', attack_num: '1' } });
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(1);
    const text = stripAnsiCodes(client.println.mock.calls[0][0]);
    expect(text).toContain('Atakujesz inny cel');
  });

  test('does not print when targets match', () => {
    client.TeamManager.getAttackTargetId.mockReturnValue('1');
    client.TeamManager.getLeader.mockReturnValue('Leader');
    client.TeamManager.getAccumulatedObjectsData.mockReturnValue({ '10': { desc: 'Leader', attack_num: '1' } });
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).not.toHaveBeenCalled();
  });

  test('prints again after state changes', () => {
    client.TeamManager.getAttackTargetId.mockReturnValue('2');
    client.TeamManager.getLeader.mockReturnValue('Leader');
    client.TeamManager.getAccumulatedObjectsData.mockReturnValue({ '10': { desc: 'Leader', attack_num: '1' } });
    client.sendEvent('teamLeaderTargetNoAvatar');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(2);
    client.TeamManager.getAttackTargetId.mockReturnValue('1');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(2);
    client.TeamManager.getAttackTargetId.mockReturnValue('2');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(3);
  });
});
