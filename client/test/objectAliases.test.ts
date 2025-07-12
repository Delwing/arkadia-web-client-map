import initObjectAliases from '../src/scripts/objectAliases';

class FakeClient {
  ObjectManager = {
    getObjectsOnLocation: jest.fn(() => []),
  };
  TeamManager = {
    getAttackTargetId: jest.fn(() => undefined),
    getDefenseTargetId: jest.fn(() => undefined),
  };
  sendCommand = jest.fn();
}

describe('object aliases', () => {
  let client: FakeClient;
  let kill: (m: RegExpMatchArray) => void;
  let shield: (m: RegExpMatchArray) => void;
  let killTarget: () => void;
  let shieldTarget: () => void;

  beforeEach(() => {
    client = new FakeClient();
    const aliases: { pattern: RegExp; callback: (m: RegExpMatchArray) => void }[] = [];
    initObjectAliases((client as unknown) as any, aliases);
    kill = aliases[0].callback as any;
    shield = aliases[1].callback as any;
    killTarget = aliases[2].callback as any;
    shieldTarget = aliases[3].callback as any;
    (global as any).Input = { send: jest.fn() };
  });

  test('kill alias sends zabij with object number', () => {
    client.ObjectManager.getObjectsOnLocation.mockReturnValue([{ num: 5, shortcut: '1' }]);
    kill(['', '1'] as unknown as RegExpMatchArray);
    expect(client.sendCommand).toHaveBeenCalledWith('zabij ob_5');
  });

  test('zaslon alias sends zaslon with object number', () => {
    client.ObjectManager.getObjectsOnLocation.mockReturnValue([{ num: 7, shortcut: 'A' }]);
    shield(['', 'A'] as unknown as RegExpMatchArray);
    expect(client.sendCommand).toHaveBeenCalledWith('zaslon ob_7');
  });

  test('/z alias attacks attack target', () => {
    client.TeamManager.getAttackTargetId.mockReturnValue('10');
    killTarget();
    expect(client.sendCommand).toHaveBeenCalledWith('zabij ob_10');
  });

  test('/za alias covers defense target', () => {
    client.TeamManager.getDefenseTargetId.mockReturnValue('15');
    shieldTarget();
    expect(client.sendCommand).toHaveBeenCalledWith('zaslon ob_15');
  });
});
