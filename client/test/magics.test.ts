import initMagics from '../src/scripts/magics';
import { colorStringInLine, findClosestColor } from '../src/Colors';

describe('magics', () => {
    beforeEach(() => {
        localStorage.clear();
        (global as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ magics: { a: { regexps: ['alpha'] }, b: { regexps: ['beta'] } } })
        });
    });

    test('registers triggers from remote list', async () => {
        const client = { Triggers: { registerTrigger: jest.fn() } } as any;
        await initMagics(client);
        expect(fetch).toHaveBeenCalled();
        expect(localStorage.getItem('magics')).not.toBeNull();
        expect(client.Triggers.registerTrigger).toHaveBeenCalledTimes(2);
        const call = client.Triggers.registerTrigger.mock.calls[0];
        const pattern = call[0];
        const callback = call[1];
        const colored = colorStringInLine('alpha test', pattern, findClosestColor('#B22222'));
        expect(callback('alpha test', 'alpha test', {} as any)).toBe(colored);
    });
});
