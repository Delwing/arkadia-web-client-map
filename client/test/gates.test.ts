import Triggers from '../src/Triggers';

const set = jest.fn();
const FunctionalBind = jest.fn().mockImplementation(() => ({ set, newMessage: jest.fn() }));
jest.mock('../src/scripts/functionalBind', () => ({ FunctionalBind }));

import initGates from '../src/scripts/gates';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  addEventListener = jest.fn();
}

describe('gates triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    set.mockClear();
    FunctionalBind.mockClear();
    initGates((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
  });

  test('binding is set and callback sends command', () => {
    expect(FunctionalBind).toHaveBeenCalledWith(client, { key: 'Digit2', ctrl: true, label: 'CTRL+2' });
    expect(set).toHaveBeenCalledTimes(1);
    const initCb = set.mock.calls[0][1];
    initCb();
    expect((global as any).Input.send).toHaveBeenCalledWith('zastukaj we wrota');

    parse('Probujesz otworzyc masywne wrota.');
    expect(set).toHaveBeenCalledTimes(2);
    const [label, cb] = set.mock.calls[1];
    expect(label).toBe('zastukaj we wrota');
    cb();
    expect((global as any).Input.send).toHaveBeenCalledTimes(2);
  });

  test('niewielka furtka pattern', () => {
    parse('Probujesz otworzyc niewielka furtke.');
    expect(set).toHaveBeenCalledTimes(2);
  });
});

