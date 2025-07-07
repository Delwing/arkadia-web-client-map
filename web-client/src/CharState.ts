import ArkadiaClient from "./ArkadiaClient.ts";

const MAX_STATE = {
    hp: 6,
    mana: 8,
    fatigue: 8,
    improve: 14,
    form: 6,
    intox: 9,
    headache: 5,
    stuffed: 2,
    soaked: 2,
    encumbrance: 5,
    panic: 4,
} as const;

export interface CharStateData {
    hp: number;
    mana: number;
    fatigue: number;
    improve: number;
    form: number;
    intox: number;
    headache: number;
    stuffed: number;
    soaked: number;
    encumbrance: number;
    panic: number;
}

export default class CharState {
    private client: typeof ArkadiaClient;
    private container: HTMLElement | null;

    constructor(client: typeof ArkadiaClient) {
        this.client = client;
        this.container = document.getElementById('char-state');
        this.client.on('gmcp.char.state', (state: CharStateData) => this.update(state));
    }

    private update(state: CharStateData) {
        console.log(state);
        if (!this.container) return;

        const entries: [keyof CharStateData, number][] = Object.entries(state) as [keyof CharStateData, number][];
        this.container.textContent = entries
            .map(([key, value]) => `${key.toUpperCase()}: ${value}/${MAX_STATE[key]}`)
            .join(' ');
    }
}
