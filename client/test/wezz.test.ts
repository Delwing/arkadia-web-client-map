import initHerbCounter from '../src/scripts/herbCounter';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  aliases: { pattern: RegExp; callback: Function }[] = [];
  Triggers = { registerTrigger: jest.fn() } as any;
  sendCommand = jest.fn();
  println = jest.fn();
  port = { postMessage: jest.fn() } as any;
  storage = {
    setItem: jest.fn((key: string, value: any) => this.port.postMessage({ type: 'SET_STORAGE', key, value })),
    request: jest.fn()
  } as any;
  addEventListener(event: string, cb: any) { this.emitter.on(event, cb); }
  removeEventListener(event: string, cb: any) { this.emitter.off(event, cb); }
  dispatch(event: string, detail: any) { this.emitter.emit(event, { detail }); }
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('wezz alias', () => {
  let client: FakeClient;
  beforeEach(() => {
    client = new FakeClient();
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
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
    initHerbCounter((client as unknown) as any, client.aliases);
    client.dispatch('storage', {
      key: 'herb_counts',
      value: { 1: { deliona: 1 }, 2: { deliona: 1 } }
    });
  });

  test('takes herbs from multiple bags', async () => {
    const alias = client.aliases.find(a => a.pattern.test('/wezz deliona 2'))!;
    const m = '/wezz deliona 2'.match(alias.pattern) as RegExpMatchArray;
    await alias.callback(m);
    expect(client.sendCommand).toHaveBeenNthCalledWith(1, 'otworz 1. woreczek');
    expect(client.sendCommand).toHaveBeenNthCalledWith(2, 'wez zolty jasny kwiat z 1. woreczka');
    expect(client.sendCommand).toHaveBeenNthCalledWith(3, 'zamknij 1. woreczek');
    expect(client.sendCommand).toHaveBeenNthCalledWith(4, 'otworz 2. woreczek');
    expect(client.sendCommand).toHaveBeenNthCalledWith(5, 'wez zolty jasny kwiat z 2. woreczka');
    expect(client.sendCommand).toHaveBeenNthCalledWith(6, 'zamknij 2. woreczek');
    expect(client.port.postMessage).toHaveBeenCalledWith({ type: 'SET_STORAGE', key: 'herb_counts', value: { 1: {}, 2: {} } });
  });

  test('takes multiple herbs from one bag in bulk', async () => {
    client.dispatch('storage', {
      key: 'herb_counts',
      value: { 1: { deliona: 5 } }
    });
    const alias = client.aliases.find(a => a.pattern.test('/wezz deliona 3'))!;
    const m = '/wezz deliona 3'.match(alias.pattern) as RegExpMatchArray;
    await alias.callback(m);
    expect(client.sendCommand).toHaveBeenNthCalledWith(1, 'otworz 1. woreczek');
    expect(client.sendCommand).toHaveBeenNthCalledWith(
      2,
      'wez 3 zolte jasne kwiaty z 1. woreczka'
    );
    expect(client.sendCommand).toHaveBeenNthCalledWith(3, 'zamknij 1. woreczek');
    expect(client.port.postMessage).toHaveBeenCalledWith({
      type: 'SET_STORAGE',
      key: 'herb_counts',
      value: { 1: { deliona: 2 } }
    });
  });

  test('defaults to one herb', async () => {
    const alias = client.aliases.find(a => a.pattern.test('/wezz deliona'))!;
    const m = '/wezz deliona'.match(alias.pattern) as RegExpMatchArray;
    await alias.callback(m);
    expect(client.sendCommand).toHaveBeenNthCalledWith(1, 'otworz 1. woreczek');
    expect(client.sendCommand).toHaveBeenNthCalledWith(2, 'wez zolty jasny kwiat z 1. woreczka');
    expect(client.sendCommand).toHaveBeenNthCalledWith(3, 'zamknij 1. woreczek');
    expect(client.port.postMessage).toHaveBeenCalledWith({ type: 'SET_STORAGE', key: 'herb_counts', value: { 1: {}, 2: { deliona: 1 } } });
  });
});
