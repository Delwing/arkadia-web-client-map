import PackageHelper from '../src/PackageHelper';
import { colorString, findClosestColor } from '../src/Colors';

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
      FunctionalBind: { set: jest.fn(), clear: jest.fn() },
    };
    helper = new PackageHelper(client);
  });

  test('packageLineCallback returns clickable line and stores package', () => {
    const cb = helper['packageLineCallback']();
    client.OutputHandler.makeClickable.mockReturnValue('click');

    const rawLine = " |1. Bob 1/2/3 5";
    const packageLineRegex = /^ \|.*?(?<number>\d+)?\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr|(?<time>\d+))/;
    const match = rawLine.match(packageLineRegex)!;
    const result = cb(rawLine, '', match);

    expect(result).toBe('click');
    expect(helper['packages']).toEqual([{ name: 'Bob', time: '5' }]);
    expect(client.OutputHandler.makeClickable).toHaveBeenCalledTimes(1);
    const call = client.OutputHandler.makeClickable.mock.calls[0];
    const expectedColor = colorString(
      rawLine,
      'Bob',
      findClosestColor('#aaaaaa')
    );
    expect(call[0]).toBe(expectedColor);
    expect(call[1]).toBe('Bob');
    expect(call[3]).toBe('wybierz paczke 1');
    call[2]();
    expect((global as any).Input.send).toHaveBeenCalledWith('wybierz paczke 1');
  });

  test('handleCommand ignores commands without pick', () => {
    helper['handleCommand']('foo');
    expect(client.Triggers.registerOneTimeTrigger).not.toHaveBeenCalled();
  });

  test('handleCommand registers one-time trigger when picking package', () => {
    helper['packages'] = [{ name: 'Bob' }];
    jest.spyOn(helper as any, 'leadToPackage').mockImplementation();
    client.Triggers.registerOneTimeTrigger
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('delivery');

    helper['handleCommand']('wybierz paczke 1');

    expect(helper['pick']).toBe(1);
    expect(client.Triggers.registerOneTimeTrigger).toHaveBeenCalledTimes(1);

    const cb = client.Triggers.registerOneTimeTrigger.mock.calls[0][1];
    cb('', '', {} as any);

    expect(helper.leadToPackage).toHaveBeenCalledWith('Bob');
    expect(helper.currentPackage).toEqual({ name: 'Bob', time: undefined });
    expect(client.Triggers.registerOneTimeTrigger).toHaveBeenCalledTimes(2);
    expect(helper.deliveryTrigger).toBe('delivery');
  });
});
