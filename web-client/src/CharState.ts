import ArkadiaClient from "./ArkadiaClient.ts";

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
        const { hp, fatigue, stuffed, soaked, encumbrance } = state;
        this.container.textContent = `HP: ${hp} Fatigue: ${fatigue} Stuffed: ${stuffed} Soaked: ${soaked} Enc: ${encumbrance}`;
    }
}
