import initArmorEvaluation from '../src/scripts/armorEvaluation';
import Triggers, { stripAnsiCodes } from '../src/Triggers';

class FakeClient {
  Triggers = new Triggers(({} as unknown) as any);
  print = jest.fn();
}

describe('armor evaluation trigger', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initArmorEvaluation((client as unknown) as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
  });

  test('parses evaluation line', () => {
    parse('Twoje doswiadczenie i umiejetnosci podpowiadaja ci, ze jak na ciezka zbroje chroni ona bardzo dobrze przed obrazeniami klutymi, doskonale przed cietymi i doskonale przed obuchowymi.');

    const output = stripAnsiCodes(client.print.mock.calls[0][0]);
    expect(output).toContain('Typ zbroi: ciezka');
    expect(output).toContain('Klute: bardzo dobrze [10/12]');
    expect(output).toContain('Ciete: doskonale [11/12]');
    expect(output).toContain('Obuchowe: doskonale [11/12]');
    expect(output).toContain('Suma: 32');
    expect(output).toContain('Srednia: 10.67');
  });
});
