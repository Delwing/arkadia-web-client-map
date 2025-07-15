import initLeaderAttackWarning from '../src/scripts/leaderAttackWarning';
import { stripAnsiCodes } from '../src/Triggers';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  TeamManager = {} as any;
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
    jest.useFakeTimers();
    initLeaderAttackWarning((client as unknown) as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('prints warning when event fired', () => {
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(1);
    const text = stripAnsiCodes(client.println.mock.calls[0][0]);
    expect(text).toContain('Atakujesz inny cel');
  });

  test('does not print again while interval is active', () => {
    client.sendEvent('teamLeaderTargetNoAvatar');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(1);
  });

  test('prints again after state changes', () => {
    client.sendEvent('teamLeaderTargetNoAvatar');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(1);
    client.sendEvent('teamLeaderTargetAvatar');
    client.sendEvent('teamLeaderTargetNoAvatar');
    expect(client.println).toHaveBeenCalledTimes(2);
  });
});
