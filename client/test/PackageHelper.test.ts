import PackageHelper from '../src/PackageHelper';
import { colorStringInLine, findClosestColor } from '../src/Colors';

describe('PackageHelper', () => {
  let helper: any;
  let client: any;

  beforeEach(() => {
    (global as any).Input = { send: jest.fn() };
    client = {
      Triggers: {
        registerTrigger: jest.fn(),
        registerOneTimeTrigger: jest.fn(),
        removeTrigger: jest.fn(),
        removeByTag: jest.fn(),
      },
      OutputHandler: {
        makeClickable: jest.fn(),
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      sendEvent: jest.fn(),
      createButton: jest.fn(() => ({ remove: jest.fn() })),
      println: jest.fn(),
      Map: { currentRoom: { id: 123 } },
      port: { postMessage: jest.fn() },
      FunctionalBind: { set: jest.fn(), clear: jest.fn(), newMessage: jest.fn() },
      sendCommand: jest.fn(),
    };
    helper = new PackageHelper(client);
  });

  test('packageLineCallback returns clickable line and stores package', () => {
    const cb = helper['packageLineCallback']();
    client.OutputHandler.makeClickable.mockReturnValue('click');

    const rawLine = " |1. Bob 1/2/3 5";
    const packageLineRegex = /^ \|\s*(?<heavy>\*)?\s*(?<number>\d+)\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr\.|(?<time>\d+))/;
    const match = rawLine.match(packageLineRegex)!;
    const result = cb(rawLine, '', match);

    expect(result).toBe('click');
    expect(helper['packages']).toEqual([{ name: 'Bob', time: '5' }]);
    expect(client.OutputHandler.makeClickable).toHaveBeenCalledTimes(1);
    const call = client.OutputHandler.makeClickable.mock.calls[0];
    const expectedColor = colorStringInLine(rawLine, 'Bob', findClosestColor('#aaaaaa'));
    expect(call[0]).toBe(expectedColor);
    expect(call[1]).toBe('Bob');
    expect(call[3]).toBe('wybierz paczke 1');
    call[2]();
    expect(client.sendCommand).toHaveBeenCalledWith('wybierz paczke 1');
  });

  test('handleCommand ignores commands without pick', () => {
    helper['handleCommand']('foo');
    expect(client.Triggers.registerOneTimeTrigger).not.toHaveBeenCalled();
  });

  test('handleCommand registers triggers when picking package', () => {
    helper['packages'] = [{ name: 'Bob' }];
    jest.spyOn(helper as any, 'leadToPackage').mockImplementation();
    client.Triggers.registerOneTimeTrigger
      .mockReturnValueOnce('pickTrigger')
      .mockReturnValueOnce('failTrigger')
      .mockReturnValueOnce('delivery');

    helper['handleCommand']('wybierz paczke 1');

    expect(helper['pick']).toBe(1);
    expect(client.Triggers.registerOneTimeTrigger).toHaveBeenCalledTimes(2);

    const successCb = client.Triggers.registerOneTimeTrigger.mock.calls[0][1];
    successCb('', '', {} as any);

    expect(helper.leadToPackage).toHaveBeenCalledWith('Bob');
    expect(helper.currentPackage).toEqual({ name: 'Bob', time: undefined });
    expect(client.Triggers.registerOneTimeTrigger).toHaveBeenCalledTimes(3);
    expect(client.Triggers.removeTrigger).toHaveBeenCalledWith('failTrigger');
    expect(helper.deliveryTrigger).toBe('delivery');
  });

  test('handleCommand cancels pick when not trusted', () => {
    helper['packages'] = [{ name: 'Bob' }];
    client.Triggers.registerOneTimeTrigger
      .mockReturnValueOnce('pickTrigger')
      .mockReturnValueOnce('failTrigger');

    helper['handleCommand']('wybierz paczke 1');

    const failCb = client.Triggers.registerOneTimeTrigger.mock.calls[1][1];
    failCb('', '', {} as any);

    expect(client.Triggers.removeTrigger).toHaveBeenCalledWith('pickTrigger');
  });

  test('packageTableCallback simplifies output when width is small', () => {
    client.contentWidth = 50;
    client.OutputHandler.makeClickable.mockImplementation(l => l);

    const cb = helper['packageTableCallback']();
    const raw =
      'Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:\n' +
      ' |   1. Bob                     0/ 1/ 2        nieogr.\n' +
      " | * 2. Tom, Foo                1/ 2/ 3        5\n" +
      'Symbolem * oznaczono przesylki ciezkie.';

    const result = cb(raw);
    const lines = result.split('\n').map(l => l.replace(/\x1B\[[0-9;]*m/g, ''));
    expect(lines[0]).toBe('Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:');
    expect(lines[1]).toBe('1. Bob');
    expect(lines[2]).toBe('   0/1/2 nieogr.');
    expect(lines[3]).toBe('* 2. Tom, Foo');
    expect(lines[4]).toBe('   1/2/3 5 godz.');
    expect(helper['packages']).toEqual([
      { name: 'Bob', time: undefined },
      { name: 'Tom', time: '5' },
    ]);
  });
});
