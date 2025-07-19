import initMagics, { MAGICS_COLOR } from '../src/scripts/magics';
import { colorStringInLine } from '../src/Colors';

describe('magics', () => {
    beforeEach(() => {
        localStorage.clear();
        (global as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ magics: { a: { regexps: ['alpha'] }, b: { regexps: ['beta'] } } })
        });
    });

    test('registers triggers from remote list without localStorage', async () => {
        const client = { Triggers: { registerTokenTrigger: jest.fn() } } as any;
        await initMagics(client);
        expect(fetch).toHaveBeenCalled();
        expect(localStorage.getItem('magics')).toBeNull();
        expect(client.Triggers.registerTokenTrigger).toHaveBeenCalledTimes(2);
        const call = client.Triggers.registerTokenTrigger.mock.calls[0];
        const pattern = call[0];
        const callback = call[1];
        const colored = colorStringInLine('alpha test', pattern, MAGICS_COLOR);
        expect(callback('alpha test', 'alpha test', {} as any)).toBe(colored);
    });
});
