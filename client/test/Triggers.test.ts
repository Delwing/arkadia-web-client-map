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

  test('parseMultiline executes registered multiline trigger', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn(() => 'changed');
    triggers.registerMultilineTrigger(/foo\nbar/, cb);

    const result = triggers.parseMultiline('foo\nbar', '');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(result).toBe('changed');
  });

  test('trigger stays open for specified lines enabling children', () => {
    const triggers = new Triggers({} as any);
    const parent = triggers.registerTrigger(/start/, undefined, undefined, { stayOpenLines: 2 });
    const childCb = jest.fn();
    parent.registerChild(/child/, childCb);

    triggers.parseLine('start', '');
    triggers.parseLine('child', '');
    triggers.parseLine('child', '');
    triggers.parseLine('child', '');

    expect(childCb).toHaveBeenCalledTimes(2);
  });

  test('token trigger matches whole words', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn();
    triggers.registerTokenTrigger('hello', cb);

    triggers.parseLine('say hello there', '');

    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('token trigger ignores partial matches', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn();
    triggers.registerTokenTrigger('hell', cb);

    triggers.parseLine('shell', '');

    expect(cb).not.toHaveBeenCalled();
  });

  test('token trigger matches multi word tokens', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn();
    triggers.registerTokenTrigger('hello world', cb);

    triggers.parseLine('say hello world there', '');

    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('token trigger matches three word tokens', () => {
    const triggers = new Triggers({} as any);
    const cb = jest.fn();
    triggers.registerTokenTrigger('one two three', cb);

    triggers.parseLine('prefix one two three suffix', '');

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
