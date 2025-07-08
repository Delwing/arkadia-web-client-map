import ObjectManager from '../src/ObjectManager';
import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  addEventListener(event: string, cb: any) {
    this.emitter.on(event, cb);
    return () => this.emitter.off(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.emitter.off(event, cb);
  }
  sendEvent(type: string, detail?: any) {
    this.emitter.emit(type, { detail });
  }
}

describe('ObjectManager', () => {
  let client: FakeClient;
  let manager: ObjectManager;

  beforeEach(() => {
    client = new FakeClient();
    manager = new ObjectManager((client as unknown) as any);
  });

  test('stores nums and data and returns objects', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Goblin', hp: 5, attack_target: true },
    });
    client.sendEvent('gmcp.object.nums', ['1']);
    expect(manager.getObjectsOnLocation()).toEqual([
      { num: '1', desc: 'Goblin', state: 5, attack_target: true },
    ]);
  });

  test('supports nums property object', () => {
    client.sendEvent('gmcp.objects.data', {
      '2': { desc: 'Orc', hp: 10 },
    });
    client.sendEvent('gmcp.object.nums', { nums: [2] });
    expect(manager.getObjectsOnLocation()).toEqual([
      { num: '2', desc: 'Orc', state: 10, attack_target: undefined },
    ]);
  });
});
