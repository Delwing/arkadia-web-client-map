import OutputHandler from '../src/OutputHandler';

class FakeClient {
  eventTarget = new EventTarget();
  addEventListener(event: string, cb: any, options?: any) {
    this.eventTarget.addEventListener(event, cb, options);
    return () => this.eventTarget.removeEventListener(event, cb, options);
  }
  removeEventListener(event: string, cb: any) {
    this.eventTarget.removeEventListener(event, cb);
  }
  dispatch(type: string, detail?: any) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

describe('OutputHandler clickable text', () => {
  test('handles clicks without span elements', () => {
    document.body.innerHTML = '<div id="main_text_output_msg_wrapper"></div>';
    const client = new FakeClient();
    const handler = new OutputHandler((client as unknown) as any);
    const wrapper = document.getElementById('main_text_output_msg_wrapper')!;
    const div = document.createElement('div');
    div.className = 'output_msg';
    const msg = document.createElement('div');
    msg.className = 'output_msg_text';
    const cb = jest.fn();
    msg.textContent = handler.makeClickable('Click', 'Click', cb);
    div.appendChild(msg);
    wrapper.appendChild(div);

    client.dispatch('output-sent', 1);

    const span = msg.querySelector('span') as HTMLSpanElement | null;
    expect(span).not.toBeNull();
    expect(msg.textContent).toBe('Click');
    span!.onclick!(new MouseEvent('click'));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
