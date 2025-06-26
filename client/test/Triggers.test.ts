import Triggers from '../src/Triggers';

describe('Triggers', () => {
  test('parseLine executes registered trigger and returns callback output', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn(() => 'processed');
    triggers.registerTrigger(/foo/, cb);

    const result = triggers.parseLine('foo', '');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(result).toBe('processed');
  });

  test('registerOneTimeTrigger only fires once', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn();
    triggers.registerOneTimeTrigger(/bar/, cb);

    triggers.parseLine('bar', '');
    triggers.parseLine('bar', '');

    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('removeByTag removes triggers recursively', () => {
    const triggers = new Triggers({} as any);
    const parent = triggers.registerTrigger(/baz/, undefined, 'parent');
    const childCb = jest.fn();
    parent.registerChild(/child/, childCb, 'child');

    triggers.removeByTag('child');

    triggers.parseLine('child', '');
    expect(childCb).not.toHaveBeenCalled();
  });
});
