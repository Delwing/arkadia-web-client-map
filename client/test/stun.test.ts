import initStun from '../src/scripts/stun';
import Triggers from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  prefix = jest.fn((line: string, prefix: string) => prefix + line);
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

  test('stun start sends event and formats line', () => {
    const result = parse('Powoli osuwasz sie na ziemie');
    expect(client.sendEvent).toHaveBeenCalledWith('stunStart');
    expect(result).toContain('[   OGLUCH   ] ----- JESTES OGLUSZONY -----');
  });

  test('stun end sends event', () => {
    const result = parse('Powoli dochodzisz do siebie');
    expect(client.sendEvent).toHaveBeenCalledWith('stunEnd');
    expect(result).toContain('KONIEC OGLUCHA');
  });

  test('golem stun prefixes line without events', () => {
    const line = 'golem w mgnieniu oka uderza w Bob, a on wyrwany z oslupienia, probuje ratowac sie krokiem w tyl. Jednak wiele to nie pomaga i sila uderzenia odrzuca';
    const result = parse(line);
    expect(result).toContain('[OGLUCH]');
    expect(client.sendEvent).not.toHaveBeenCalled();
  });
});
