import initDeposits, { deposits } from '../src/scripts/deposits';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  Map = { currentRoom: { id: 1, name: 'Bank', userData: { bind: '/depozyt' } } } as any;
  println = jest.fn();
}

describe('deposits', () => {
  let client: FakeClient;
  let parse: (line: string) => string;
  let refresh: () => void;
  let show: () => void;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = new FakeClient();
    const aliases: { pattern: RegExp; callback: () => void }[] = [];
    initDeposits((client as unknown) as any, aliases);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    refresh = aliases[0].callback;
    show = aliases[1].callback;
    Object.keys(deposits).forEach(k => delete deposits[parseInt(k)]);
    jest.clearAllMocks();
  });

  test('refresh command sends query', () => {
    refresh();
    expect((global as any).Input.send).toHaveBeenCalledWith('przejrzyj depozyt');
  });

  test('parses deposit contents', () => {
    parse('Twoj depozyt zawiera miecz, tarcza.');
    expect(deposits[1].items).toEqual(['miecz', 'tarcza']);
  });

  test('handles empty deposit', () => {
    parse('Twoj depozyt jest pusty.');
    expect(deposits[1].items).toEqual([]);
  });

  test('handles no deposit', () => {
    parse('Nie posiadasz wykupionego depozytu.');
    expect(deposits[1].items).toBeNull();
  });

  test('prints deposits', () => {
    parse('Twoj depozyt zawiera miecz.');
    show();
    expect(client.println).toHaveBeenCalledWith(expect.stringContaining('miecz'));
  });
});
