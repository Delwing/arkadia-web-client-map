import initShips from '../src/scripts/ships';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  FunctionalBind = { set: jest.fn(), clear: jest.fn(), newMessage: jest.fn() };
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
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe('wem;kup bilet;wsiadz na statek;wlm');
    callback();
    expect((global as any).Input.send).toHaveBeenNthCalledWith(1, 'wem');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(2, 'kup bilet');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(3, 'wsiadz na statek');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(4, 'wlm');
  });

  test('statki trigger binds without beep', () => {
    client.playSound.mockClear();
    parse('Tajemniczy okret');
    expect(client.playSound).not.toHaveBeenCalled();
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe('wem;kup bilet;wsiadz na statek;wlm');
    callback();
    expect((global as any).Input.send).toHaveBeenNthCalledWith(1, 'wem');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(2, 'kup bilet');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(3, 'wsiadz na statek');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(4, 'wlm');
  });

  test('disembark trigger sends command and event', () => {
    parse('Marynarze sprawnie cumuja');
    const [label, callback] = client.FunctionalBind.set.mock.calls.pop()!;
    expect(label).toBe('zejdz ze statku');
    callback();
    expect((global as any).Input.send).toHaveBeenCalledTimes(1);
    expect((global as any).Input.send).toHaveBeenCalledWith('zejdz ze statku');
    expect(client.sendEvent).toHaveBeenCalledWith('refreshPositionWhenAble');
  });

  test('does not bind boarding command when already on ship', () => {
    parse('Tratwa przybija do brzegu.');
    const [, boardCallback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    boardCallback();
    client.FunctionalBind.set.mockClear();
    parse('Tratwa przybija do brzegu.');
    expect(client.FunctionalBind.set).not.toHaveBeenCalled();
  });
});
