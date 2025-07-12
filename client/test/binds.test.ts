import initBinds from '../src/scripts/binds';

class FakeClient {
  FunctionalBind = { getLabel: jest.fn(() => ']') };
  lampBind = { key: 'Digit4', ctrl: true };
  println = jest.fn();
}

describe('binds alias', () => {
  test('prints current binds', () => {
    const client = new FakeClient();
    const aliases: { pattern: RegExp; callback: () => void }[] = [];
    initBinds((client as unknown) as any, aliases);
    const show = aliases[0].callback;
    show();
    expect(client.println).toHaveBeenCalledTimes(1);
    const printed = client.println.mock.calls[0][0];
    expect(printed).toContain('Domy\u015Blny: ]');
    expect(printed).toContain('Nape\u0142nij lamp\u0119: CTRL+4');
  });
});
