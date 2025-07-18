import storage from "@options/src/storage.ts";
import SettingsStorage from "@client/src/SettingsStorage";

export default class MockPort {
    listeners: Array<(msg: any) => void> = [];
    onMessage = {
        addListener: (cb: (msg: any) => void) => {
            this.listeners.push(cb);
        }
    };

    constructor() {
        storage.onChanged?.addListener(changes => {
            Object.entries(changes).forEach(([key, {newValue}]) => {
                this.dispatch({storage: {key, value: newValue}});
                if (key === 'settings' || key === 'npc') {
                    this.dispatch({[key]: newValue});
                }
            });
        });
    }

    private dispatch(message: any) {
        this.listeners.forEach(l => l(message));
    }

    postMessage(message: any) {
        if (message.type === 'NEW_NPC') {
            const npc = SettingsStorage.load('npc', [] as any[]);
            npc.push({name: message.name, loc: message.loc});
            SettingsStorage.save('npc', npc);
            this.dispatch({npc});
            this.dispatch({storage: {key: 'npc', value: npc}});
            return;
        }
        if (message.type === 'SET_STORAGE') {
            SettingsStorage.save(message.key, message.value);
            this.dispatch({storage: {key: message.key, value: message.value}});
            if (message.key === 'settings' || message.key === 'npc') {
                this.dispatch({[message.key]: message.value});
            }
        }
        if (message.type === 'GET_STORAGE') {
            this.sendStorage(message.key);
        }
    }

    private sendStorage(key: string) {
        const value = SettingsStorage.load<any>(key, null as any);
        if (value !== null && value !== undefined) {
            this.dispatch({storage: {key, value}});
            if (key === 'settings' || key === 'npc') {
                this.dispatch({[key]: value});
            }
        }
    };
}
