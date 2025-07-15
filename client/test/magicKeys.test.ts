import initMagicKeys from '../src/scripts/magicKeys';
import { colorStringInLine, findClosestColor } from '../src/Colors';

describe('magic keys', () => {
    beforeEach(() => {
        localStorage.clear();
        (global as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ magic_keys: ['alpha', 'beta'] })
        });
    });

    test('registers triggers from remote list', async () => {
        const client = { Triggers: { registerTokenTrigger: jest.fn() } } as any;
        await initMagicKeys(client);
        expect(fetch).toHaveBeenCalled();
        expect(localStorage.getItem('magic_keys')).not.toBeNull();
        expect(client.Triggers.registerTokenTrigger).toHaveBeenCalledTimes(2);
        const call = client.Triggers.registerTokenTrigger.mock.calls[0];
        const pattern = call[0];
        const callback = call[1];
        const colored = colorStringInLine('alpha test', pattern, findClosestColor('#00ff7f'));
        expect(callback('alpha test', 'alpha test', {} as any)).toBe(colored);
    });
});
