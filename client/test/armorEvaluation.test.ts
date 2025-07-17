import initArmorEvaluation from "../src/scripts/armorEvaluation";
import Triggers, { stripAnsiCodes } from "../src/Triggers";

class FakeClient {
  Triggers = new Triggers({} as unknown as any);
  print = jest.fn();
}

describe("armor evaluation trigger", () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initArmorEvaluation(client as unknown as any);
    parse = (line: string) =>
      Triggers.prototype.parseLine.call(client.Triggers, line, "");
  });

  test("parses evaluation line", () => {
    parse(
      "Twoje doswiadczenie i umiejetnosci podpowiadaja ci, ze jak na ciezka zbroje chroni ona bardzo dobrze przed obrazeniami klutymi, doskonale przed cietymi i doskonale przed obuchowymi.",
    );

    const output = stripAnsiCodes(client.print.mock.calls[0][0]);
    expect(output).toContain("Typ zbroi: ciezka");
    expect(output).toContain("Klute: [10/12]");
    expect(output).toContain("Ciete:     [11/12]");
    expect(output).toContain("Obuchowe: [11/12]");
    expect(output).toContain("Suma: 32");
    expect(output).toContain("Srednia: 10.67");
  });

  test("parses shield evaluation with parry", () => {
    parse(
      "Twoje doswiadczenie i umiejetnosci podpowiadaja ci, ze chroni ona doskonale przed obrazeniami cietymi. Ponadto jest bardzo skuteczna w parowaniu ciosow.",
    );

    const output = stripAnsiCodes(client.print.mock.calls[0][0]);
    expect(output).toContain("Typ zbroi: tarcza");
    expect(output).toContain("Klute: [11/12]");
    expect(output).toContain("Ciete:     [11/12]");
    expect(output).toContain("Obuchowe: [11/12]");
    expect(output).toContain("Parowanie: [10/14]");
    expect(output).toContain("Suma: 33");
    expect(output).toContain("Srednia: 11");
  });
});
