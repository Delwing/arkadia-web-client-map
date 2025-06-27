(window as any).Input = { send: jest.fn() };
const parseCommand = jest.fn((cmd: string) => `parsed:${cmd}`);

import Client from '../src/Client';

jest.mock('../src/Triggers', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ parseLine: jest.fn((l: string) => l) })) }));
jest.mock('../src/PackageHelper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../src/OutputHandler', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../src/scripts/functionalBind', () => ({ FunctionalBind: jest.fn() }));
jest.mock('../src/main', () => ({ __esModule: true, rawSend: jest.fn() }));


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

  expect(originalOutputSend).toHaveBeenNthCalledWith(1, 'processed');
  expect(originalOutputSend).toHaveBeenNthCalledWith(2, 'printed', undefined);
});

