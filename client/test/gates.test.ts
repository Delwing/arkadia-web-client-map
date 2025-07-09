import Triggers from '../src/Triggers';

import initGates from '../src/scripts/gates';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  FunctionalBind = { set: jest.fn(), clear: jest.fn(), newMessage: jest.fn() };
  addEventListener = jest.fn();
}

describe('gates triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    jest.clearAllMocks();
    initGates((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
  });

  test('binding is set and callback sends command', () => {
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(1);
    const initCb = (client.FunctionalBind.set as jest.Mock).mock.calls[0][1];
    initCb();
    expect((global as any).Input.send).toHaveBeenCalledWith('zastukaj we wrota');

    parse('Probujesz otworzyc masywne wrota.');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(2);
    const [label, cb] = (client.FunctionalBind.set as jest.Mock).mock.calls[1];
    expect(label).toBe('zastukaj we wrota');
    cb();
    expect((global as any).Input.send).toHaveBeenCalledTimes(2);
  });

  test('niewielka furtka pattern', () => {
    parse('Probujesz otworzyc niewielka furtke.');
    expect(client.FunctionalBind.set).toHaveBeenCalledTimes(2);
  });
});

