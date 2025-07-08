import initObjectAliases from '../src/scripts/objectAliases';

class FakeClient {
  ObjectManager = {
    getObjectsOnLocation: jest.fn(() => []),
  };
}

describe('object aliases', () => {
  let client: FakeClient;
  let kill: (m: RegExpMatchArray) => void;
  let shield: (m: RegExpMatchArray) => void;

  beforeEach(() => {
    client = new FakeClient();
    const aliases: { pattern: RegExp; callback: (m: RegExpMatchArray) => void }[] = [];
    initObjectAliases((client as unknown) as any, aliases);
    kill = aliases[0].callback as any;
    shield = aliases[1].callback as any;
    (global as any).Input = { send: jest.fn() };
  });

  test('kill alias sends zabij with object number', () => {
    client.ObjectManager.getObjectsOnLocation.mockReturnValue([{ num: 5, shortcut: '1' }]);
    kill(['', '1'] as unknown as RegExpMatchArray);
    expect((global as any).Input.send).toHaveBeenCalledWith('zabij 5');
  });

  test('zaslon alias sends zaslon with object number', () => {
    client.ObjectManager.getObjectsOnLocation.mockReturnValue([{ num: 7, shortcut: 'A' }]);
    shield(['', 'A'] as unknown as RegExpMatchArray);
    expect((global as any).Input.send).toHaveBeenCalledWith('zaslon 7');
  });
});
