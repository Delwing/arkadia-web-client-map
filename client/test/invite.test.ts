import initInvite from '../src/scripts/invite';
import Client from '../src/Client';

// Mock the people.json import
jest.mock('../src/people.json', () => [
    { name: 'Mordimer', guild: 'Templariusze' },
    { name: 'Vesper', guild: 'Magowie' },
    { name: 'Pablo', guild: 'Rycerze' },
    { name: 'Gandalf', guild: 'Czarodzieje' }
], { virtual: true });

describe('Invite functionality', () => {
    let client: Client;
    let mockTriggers: any;
    let mockFunctionalBind: any;
    let mockPrintln: jest.Mock;
    let mockAddEventListener: jest.Mock;
    let mockTeamManager: any;
    let mockSendCommand: jest.Mock;

    beforeEach(() => {
        mockTriggers = {
            registerTrigger: jest.fn()
        };

        mockFunctionalBind = {
            set: jest.fn()
        };

        mockPrintln = jest.fn();
        mockAddEventListener = jest.fn();
        mockSendCommand = jest.fn();

        mockTeamManager = {
            getAccumulatedObjectsData: jest.fn().mockReturnValue({
                "1": { desc: "Vesper", living: true, team: true },
                "2": { desc: "Pablo", living: true, team: true },
                "3": { desc: "Gandalf", living: true, team: true }
            })
        };

        client = {
            Triggers: mockTriggers,
            FunctionalBind: mockFunctionalBind,
            println: mockPrintln,
            sendCommand: mockSendCommand,
            addEventListener: mockAddEventListener,
            TeamManager: mockTeamManager
        } as any;

        initInvite(client);
    });

    test('should register invite trigger', () => {
        expect(mockTriggers.registerTrigger).toHaveBeenCalledWith(
            expect.any(RegExp),
            expect.any(Function),
            'invite'
        );
    });

    test('should block invite from enemy guild member', () => {
        // Set up enemy guilds
        const settingsHandler = mockAddEventListener.mock.calls.find(
            call => call[0] === 'settings'
        )[1];
        settingsHandler({ detail: { enemyGuilds: ['Templariusze'] } });

        // Get the trigger handler
        const triggerHandler = mockTriggers.registerTrigger.mock.calls[0][1];

        // Test invite from enemy guild member
        const result = triggerHandler(
            '[Mordimer] zaprasza cie do swojej druzyny.',
            '[Mordimer] zaprasza cie do swojej druzyny.',
            ['[Mordimer] zaprasza cie do swojej druzyny.', 'Mordimer']
        );

        expect(result).toBe('');
    });

    test('should allow invite from non-enemy guild member and execute two commands', () => {
        // Set up enemy guilds
        const settingsHandler = mockAddEventListener.mock.calls.find(
            call => call[0] === 'settings'
        )[1];
        settingsHandler({ detail: { enemyGuilds: ['Templariusze'] } });

        // Get the trigger handler
        const triggerHandler = mockTriggers.registerTrigger.mock.calls[0][1];

        // Test invite from non-enemy guild member
        const result = triggerHandler(
            '[Vesper] zaprasza cie do swojej druzyny.',
            '[Vesper] zaprasza cie do swojej druzyny.',
            ['[Vesper] zaprasza cie do swojej druzyny.', 'Vesper']
        );

        expect(mockFunctionalBind.set).toHaveBeenCalledWith(
            'Przyjmij zaproszenie od Vesper',
            expect.any(Function)
        );
        expect(result).toBe('[Vesper] zaprasza cie do swojej druzyny.');

        // Test that the functional bind executes both commands
        const functionalBindCallback = mockFunctionalBind.set.mock.calls[0][1];
        functionalBindCallback();

        expect(mockSendCommand).toHaveBeenCalledWith('porzuc druzyne');
        expect(mockSendCommand).toHaveBeenCalledWith('dolacz do ob_1');
        expect(mockSendCommand).toHaveBeenCalledTimes(2);
    });

    test('should allow invite from unknown person and fallback to old command', () => {
        // Set up enemy guilds
        const settingsHandler = mockAddEventListener.mock.calls.find(
            call => call[0] === 'settings'
        )[1];
        settingsHandler({ detail: { enemyGuilds: ['Templariusze'] } });

        // Get the trigger handler
        const triggerHandler = mockTriggers.registerTrigger.mock.calls[0][1];

        // Test invite from unknown person
        const result = triggerHandler(
            '[UnknownPlayer] zaprasza cie do swojej druzyny.',
            '[UnknownPlayer] zaprasza cie do swojej druzyny.',
            ['[UnknownPlayer] zaprasza cie do swojej druzyny.', 'UnknownPlayer']
        );

        expect(mockFunctionalBind.set).not.toHaveBeenCalled();
        expect(result).toBe('[UnknownPlayer] zaprasza cie do swojej druzyny.');
        expect(mockSendCommand).not.toHaveBeenCalled();
    });

    test('should allow all invites when no enemy guilds are set and fallback to old command', () => {
        // Set up empty enemy guilds
        const settingsHandler = mockAddEventListener.mock.calls.find(
            call => call[0] === 'settings'
        )[1];
        settingsHandler({ detail: { enemyGuilds: [] } });

        // Get the trigger handler
        const triggerHandler = mockTriggers.registerTrigger.mock.calls[0][1];

        // Test invite from guild member that would be enemy if configured
        const result = triggerHandler(
            '[Mordimer] zaprasza cie do swojej druzyny.',
            '[Mordimer] zaprasza cie do swojej druzyny.',
            ['[Mordimer] zaprasza cie do swojej druzyny.', 'Mordimer']
        );

        expect(mockFunctionalBind.set).not.toHaveBeenCalled();
        expect(result).toBe('[Mordimer] zaprasza cie do swojej druzyny.');
        expect(mockSendCommand).not.toHaveBeenCalled();
    });

    test('should handle invite pattern without brackets', () => {
        // Set up enemy guilds
        const settingsHandler = mockAddEventListener.mock.calls.find(
            call => call[0] === 'settings'
        )[1];
        settingsHandler({ detail: { enemyGuilds: ['Czarodzieje'] } });

        // Get the trigger handler
        const triggerHandler = mockTriggers.registerTrigger.mock.calls[0][1];

        // Test invite without brackets
        const result = triggerHandler(
            'Gandalf zaprasza cie do swojej druzyny.',
            'Gandalf zaprasza cie do swojej druzyny.',
            ['Gandalf zaprasza cie do swojej druzyny.', 'Gandalf']
        );

        expect(result).toBe('');
    });
});
