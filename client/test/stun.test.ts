import initStun from '../src/scripts/stun';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  sendEvent = jest.fn();
}

describe('stun triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initStun((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('stun start sends event', () => {
    const result = parse('Powoli osuwasz sie na ziemie');
    expect(client.sendEvent).toHaveBeenCalledWith('stunStart');
    expect(result).toBe('Powoli osuwasz sie na ziemie');
  });

  test('stun end sends event', () => {
    const result = parse('Powoli dochodzisz do siebie');
    expect(client.sendEvent).toHaveBeenCalledWith('stunEnd');
    expect(result).toBe('Powoli dochodzisz do siebie');
  });

  test('golem stun does nothing', () => {
    const line = 'golem w mgnieniu oka uderza w Bob, a on wyrwany z oslupienia, probuje ratowac sie krokiem w tyl. Jednak wiele to nie pomaga i sila uderzenia odrzuca';
    const result = parse(line);
    expect(result).toBe(line);
    expect(client.sendEvent).not.toHaveBeenCalled();
  });
});
