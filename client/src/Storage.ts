import Client from "./Client";

type Listener = (value: any) => void;

export default class Storage {
    private client: Client;
    private cache: Record<string, any> = {};
    private listeners: Record<string, Listener[]> = {};
    private keys = new Set<string>();

    constructor(client: Client) {
        this.client = client;
        this.client.addEventListener('storage', (ev: CustomEvent) => {
            const { key, value } = ev.detail || {};
            if (!key) return;
            this.cache[key] = value;
            if (this.listeners[key]) {
                this.listeners[key].forEach(l => l(value));
            }
        });
        this.client.addEventListener('port-connected', () => {
            this.keys.forEach(k => this.request(k));
        });
    }

    request(key: string) {
        this.keys.add(key);
        this.client.port?.postMessage({ type: 'GET_STORAGE', key });
    }

    getItem<T = any>(key: string): T | undefined {
        return this.cache[key] as T | undefined;
    }

    setItem(key: string, value: any) {
        this.cache[key] = value;
        this.client.port?.postMessage({ type: 'SET_STORAGE', key, value });
    }

    onChange(key: string, listener: Listener) {
        if (!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(listener);
    }
}
