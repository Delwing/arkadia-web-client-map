import initArmorShop from '../src/scripts/armorShop';
import Triggers from '../src/Triggers';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  Triggers = new Triggers(({} as unknown) as any);
  contentWidth = 40;

  addEventListener(event: string, cb: any) {
    this.emitter.on(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.emitter.off(event, cb);
  }
  dispatch(event: string, detail: any) {
    this.emitter.emit(event, { detail });
  }
}

describe('armor shop width adjustments', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initArmorShop((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
  });

  const split = '---------------------------------------------------------------------------';
  const header = '|               Nazwa towaru              |Mithryl| Zloto | Srebro| Miedz |';
  const item = '| Stara rycerska para naudziakow          |       |   2   |   7   |   6   |';

  test('adjusts split line', () => {
    const result = parse(split);
    expect(result).toBe('-'.repeat(client.contentWidth));
  });

  test('splits header and item lines when narrow', () => {
    const h = parse(header).split('\n');
    expect(h[0]).toMatch(/Nazwa towaru/);
    expect(h[1]).toMatch(/Mithryl/);

    const it = parse(item).split('\n');
    expect(it[0]).toMatch(/rycerska/);
    expect(it[1]).toMatch(/7/);
  });

  test('leaves lines unchanged when wide enough', () => {
    client.contentWidth = 80;
    client.dispatch('contentWidth', 80);
    expect(parse(header)).toBe(header);
    expect(parse(item)).toBe(item);
  });
});
