import initHerbCounter from '../src/scripts/herbCounter';
import Triggers from '../src/Triggers';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  Triggers = new Triggers(({} as unknown) as any);
  sendCommand = jest.fn();
  println = jest.fn();
  addEventListener(event: string, cb: any) { this.emitter.on(event, cb); }
  removeEventListener(event: string, cb: any) { this.emitter.off(event, cb); }
  dispatch(event: string, detail: any) { this.emitter.emit(event, { detail }); }
}

describe('herb counter', () => {
  let client: FakeClient;
  let parse: (line: string) => string;
  let start: () => void;

  beforeEach(() => {
    client = new FakeClient();
    const aliases: { pattern: RegExp; callback: () => void }[] = [];
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        herb_id_to_odmiana: {
          deliona: {
            mianownik: 'zolty jasny kwiat',
            dopelniacz: 'zoltego jasnego kwiata',
            biernik: 'zolty jasny kwiat',
            mnoga_mianownik: 'zolte jasne kwiaty',
            mnoga_dopelniacz: 'zoltych jasnych kwiatow',
            mnoga_biernik: 'zolte jasne kwiaty'
          }
        },
        version: 1,
        herb_id_to_use: {}
      })
    });
    initHerbCounter((client as unknown) as any, aliases);
    start = aliases[0].callback as any;
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
  });

  test('counts herbs from bags', async () => {
    await start();
    expect(client.sendCommand).toHaveBeenCalledWith('policz swoje woreczki');
    parse('Doliczyles sie dwoch sztuk.');
    expect(client.sendCommand).toHaveBeenCalledWith('zajrzyj do 1. swojego woreczka');
    expect(client.sendCommand).toHaveBeenCalledWith('zajrzyj do 2. swojego woreczka');
    parse('Rozwiazujesz na chwile rzemyk, sprawdzajac zawartosc swojego woreczka. W srodku dostrzegasz dwa zolte jasne kwiaty.');
    parse('Rozwiazujesz na chwile rzemyk, sprawdzajac zawartosc swojego woreczka. W srodku dostrzegasz zolty jasny kwiat.');
    const printed = client.println.mock.calls[0][0];
    expect(printed).toMatch(/3/);
    expect(printed).toMatch(/zolty jasny kwiat/);
    expect(printed).toMatch(/deliona/);
  });
});
