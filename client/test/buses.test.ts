import initBuses from '../src/scripts/buses';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  FunctionalBind = { set: jest.fn(), clear: jest.fn() };
  playSound = jest.fn();
}

describe('buses triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    initBuses((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('exit trigger binds command and beeps', () => {
    parse('Otwarty jadacy powoz powoli zatrzymuje sie.');
    expect(client.playSound).toHaveBeenCalledTimes(1);
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe('wyjscie');
    callback();
    expect((global as any).Input.send).toHaveBeenCalledWith('wyjscie');
  });

  test('boarding trigger binds commands', () => {
    parse('dylizans powoli zatrzymuje sie.');
    expect(client.playSound).not.toHaveBeenCalled();
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe('wem;wsiadz do dylizansu;wlm');
    callback();
    expect((global as any).Input.send).toHaveBeenNthCalledWith(1, 'wem');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(2, 'wsiadz do dylizansu');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(3, 'wlm');
  });

  test('woz z plandeka triggers once', () => {
    parse('Kupiecki stojacy woz z plandeka');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
  });

  test('bryczka boarding triggers', () => {
    parse('siada w malej bryczce.');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe('wem;usiadz na bryczce;wlm');
  });
});
