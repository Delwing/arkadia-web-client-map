import initAttackBeep from '../src/scripts/attackBeep';
import Triggers from '../src/Triggers';
import {findClosestColor} from '../src/Colors';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  playSound = jest.fn();
}

describe('attack beep triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initAttackBeep((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('beeps and highlights on attack', () => {
    const result = parse('Wojownik atakuje cie!');
    expect(client.playSound).toHaveBeenCalledTimes(1);
    const prefix = `\x1B[22;38;5;${findClosestColor('#ff0000') + 1}m`;
    expect(result.startsWith(prefix)).toBe(true);
    expect(result).toContain('Wojownik atakuje cie!');
    expect(result.endsWith('\x1B[0m')).toBe(true);
  });

  test('uppercases selected phrase', () => {
    const line = 'W oczach Eamon rozpala sie swiety ogien nienawisci i z imieniem Morra na ustach rzuca sie do walki z toba!';
    const result = parse(line);
    expect(result).toContain('RZUCA SIE DO WALKI Z TOBA');
  });

  test('does not beep on plain phrase trigger', () => {
    const result = parse('atakuje cie!');
    expect(client.playSound).not.toHaveBeenCalled();
    const prefix = `\x1B[22;38;5;${findClosestColor('#ff0000') + 1}m`;
    expect(result.startsWith(prefix)).toBe(true);
    expect(result).toContain('ATAKUJE CIE');
    expect(result.includes('\x1B[0m')).toBe(true);
    expect(result.endsWith('!')).toBe(true);
  });
});
