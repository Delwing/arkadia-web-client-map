(window as any).Input = { send: jest.fn() };
(window as any).Output = { send: jest.fn(), flush_buffer: jest.fn(), buffer: [] };
(window as any).Text = { parse_patterns: jest.fn((v: any) => v) };
(window as any).Maps = {
  refresh_position: jest.fn(),
  set_position: jest.fn(),
  unset_position: jest.fn(),
  data: undefined,
};
(window as any).Gmcp = { parse_option_subnegotiation: jest.fn() };
const parseCommand = jest.fn((cmd: string) => `parsed:${cmd}`);

jest.mock('../src/main', () => ({
  __esModule: true,
  rawInputSend: jest.fn((cmd: string) => (window as any).Input.send(cmd)),
  rawOutputSend: jest.fn(),
}));

import Client from '../src/Client';
import { Howl } from 'howler';

jest.mock('howler', () => {
  const instance = {
    state: jest.fn(() => 'loaded'),
    play: jest.fn(),
    stop: jest.fn(),
    once: jest.fn(),
    load: jest.fn(),
  };
  return { Howl: jest.fn(() => instance) };
});

jest.mock('../src/Triggers', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ parseLine: jest.fn((l: string) => l) })) }));
jest.mock('../src/PackageHelper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../src/OutputHandler', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../src/scripts/functionalBind', () => ({
  FunctionalBind: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    clear: jest.fn(),
    newMessage: jest.fn(),
  })),
}));


jest.mock('../src/MapHelper', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ parseCommand })),
  };
});

beforeEach(() => {
  document.body.innerHTML = '<div id="panel_buttons_bottom"></div><iframe id="cm-frame"></iframe>';
  (window as any).Output = { flush_buffer: jest.fn(), send: jest.fn() };
  (window as any).Text = { parse_patterns: jest.fn((v: any) => v) };
});

test('createEvent returns object with type and data', () => {
  const client = new Client();
  expect(client.createEvent('t', 123)).toEqual({ type: 't', data: 123 });
});

test('addEventListener allows removal', () => {
  const client = new Client();
  const handler = jest.fn();
  const remove = client.addEventListener('foo', handler);
  client.eventTarget.dispatchEvent(new CustomEvent('foo', { detail: 'bar' }));
  expect(handler).toHaveBeenCalledTimes(1);
  remove();
  client.eventTarget.dispatchEvent(new CustomEvent('foo', { detail: 'bar' }));
  expect(handler).toHaveBeenCalledTimes(1);
});

test('println uses print with newline', () => {
  const client = new Client();
  const spy = jest.spyOn(client, 'print').mockImplementation();
  client.println('hi');
  expect(spy).toHaveBeenNthCalledWith(1, '\n');
  expect(spy).toHaveBeenNthCalledWith(2, 'hi');
  expect(spy).toHaveBeenNthCalledWith(3, '\n');
});

test('createButton creates button attached to panel', () => {
  const client = new Client();
  const cb = jest.fn();
  const button = client.createButton('name', cb);
  expect(button.value).toBe('name');
  expect(button.type).toBe('button');
  expect(button.onclick).toBe(cb);
  const panel = document.getElementById('panel_buttons_bottom');
  expect(panel?.contains(button)).toBe(true);
});

test('sendCommand dispatches event and sends parsed command', () => {
  const client = new Client();
  client.sendCommand('test');
  expect(parseCommand).toHaveBeenCalledWith('test');
  expect((window as any).Input.send).toHaveBeenCalledWith('parsed:test');
});

test('sendCommand allows empty command', () => {
  const client = new Client();
  client.sendCommand('');
  expect(parseCommand).toHaveBeenCalledWith('');
  expect((window as any).Input.send).toHaveBeenCalledWith('parsed:');
});

test('onLine sends printed messages after line and restores Output.send', () => {
  const client = new Client();
  const originalOutputSend = (window as any).Output.send;

  client.Triggers.parseLine = jest.fn(() => {
    expect((window as any).Output.send).not.toBe(originalOutputSend);
    client.print('printed');
    return 'processed';
  });

  const result = client.onLine('line', '');

  expect(result).toBe('processed');
  expect((window as any).Output.send).toBe(originalOutputSend);
  expect(originalOutputSend).not.toHaveBeenCalled();

  originalOutputSend(result);
  client.sendEvent('output-sent');
  client.sendEvent('line-sent');

  expect(originalOutputSend).toHaveBeenNthCalledWith(1, 'processed');
  expect(originalOutputSend).toHaveBeenNthCalledWith(2, 'printed', undefined);
});

test('onLine replaces reset sequences with preceding ANSI code', () => {
  const client = new Client();
  const line = '\x1b[22;38;5;1mRED\x1b[0m text \x1b[22;38;5;2mGREEN\x1b[0m';

  const result = client.onLine(line, '');

  const expected =
    '\x1b[22;38;5;1mRED\x1b[22;38;5;1m text \x1b[22;38;5;2mGREEN\x1b[22;38;5;2m';
  expect(result).toBe(expected);
});

test('onLine keeps trailing resets without preceding color', () => {
  const client = new Client();
  const line = '\x1b[22;38;5;1mred\x1b[0m\x1b[0m';

  const result = client.onLine(line, '');

  const expected = '\x1b[22;38;5;1mred\x1b[22;38;5;1m\x1b[0m';
  expect(result).toBe(expected);
});

test('onLine restores color after inserting enclosed color', () => {
  const client = new Client();
  const gray = '\x1b[22;38;5;8m';
  const yellow = '\x1b[22;38;5;11m';
  const orange = '\x1b[22;38;5;215m';

  const line =
    gray +
    'one two three four ' +
    yellow +
    'five ' +
    orange +
    'orange' +
    '\x1b[0m' +
    ' six' +
    gray +
    ' seven eight nine ten';

  const result = client.onLine(line, '');

  const expected =
    gray +
    'one two three four ' +
    yellow +
    'five ' +
    orange +
    'orange' +
    yellow +
    ' six' +
    gray +
    ' seven eight nine ten';
  expect(result).toBe(expected);
});

test('onLine preserves final reset at line end', () => {
  const client = new Client();
  const gray = '\x1b[22;38;5;8m';
  const line = gray + 'gray text' + '\x1b[0m';

  const result = client.onLine(line, '');

  expect(result).toBe(line);
});

test('playSound restarts sound when called twice', () => {
  const client = new Client();
  const sound = (Howl as jest.Mock).mock.results[0].value;

  client.playSound('beep');
  client.playSound('beep');

  expect(sound.stop).toHaveBeenCalledTimes(2);
  expect(sound.play).toHaveBeenCalledTimes(2);
});

