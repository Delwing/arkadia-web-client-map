import initLamp from '../src/scripts/lamp';
import Triggers from '../src/Triggers';
import { takeFromBag } from '../src/scripts/bagManager';

jest.mock('../src/scripts/bagManager', () => ({
  takeFromBag: jest.fn(),
}));

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  FunctionalBind = { set: jest.fn(), clear: jest.fn(), newMessage: jest.fn() };
  playSound = jest.fn();
  println = jest.fn();
}

describe('lamp triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    initLamp((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('binds empty bottle handling', () => {
    parse('butelka oleju jest pusta.');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe(' >> Odloz olej, wez butelke do reki i napelnij lampe');
    callback();
    expect((global as any).Input.send).toHaveBeenNthCalledWith(1, 'odloz olej');
    expect(takeFromBag).toHaveBeenCalledWith(client, 'olej');
    expect((global as any).Input.send).toHaveBeenNthCalledWith(2, 'napelnij lampe olejem');
  });

  test('binds bottle taking', () => {
    parse('Czym chcesz napelnic lampe');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const [label, callback] = (client.FunctionalBind.set as jest.Mock).mock.calls[0];
    expect(label).toBe(' >> Wez butelke do reki.');
    callback();
    expect(takeFromBag).toHaveBeenCalledWith(client, 'olej');
    expect((global as any).Input.send).toHaveBeenCalledWith('napelnij lampe olejem');
  });
});
