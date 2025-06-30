import initShips from '../src/scripts/ships';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  FunctionalBind = { set: jest.fn(), clear: jest.fn() };
  playSound = jest.fn();
  sendEvent = jest.fn();
}

describe('ships triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    initShips((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('boarding trigger binds command and beeps', () => {
    parse('Tratwa przybija do brzegu.');
    expect(client.playSound).toHaveBeenCalledTimes(1);
    expect(client.FunctionalBind.set).toHaveBeenCalledWith(
      'wem;kup bilet;wsiadz na statek;wlm',
      expect.any(Function)
    );
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
  });

  test('statki trigger binds without beep', () => {
    client.playSound.mockClear();
    parse('Tajemniczy okret');
    expect(client.FunctionalBind.set).toHaveBeenCalledWith(
      'wem;kup bilet;wsiadz na statek;wlm',
      expect.any(Function)
    );
    expect(client.playSound).not.toHaveBeenCalled();
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
  });

  test('disembark trigger sends command and event', () => {
    parse('Marynarze sprawnie cumuja');
    const call = client.FunctionalBind.set.mock.calls.pop()!;
    expect(call[0]).toBe('zejdz ze statku');
    call[1]();
    expect((global as any).Input.send).toHaveBeenCalledWith('zejdz ze statku');
    expect(client.sendEvent).toHaveBeenCalledWith('refreshPositionWhenAble');
  });
});
