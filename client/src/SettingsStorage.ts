export default class SettingsStorage {
    static load<T extends Record<string, any>>(key: string, defaults: T): T {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed === 'object' && parsed !== null) {
                    return { ...defaults, ...parsed } as T;
                }
            }
        } catch {
            // ignore malformed data
        }
        return { ...defaults };
    }

    static save<T>(key: string, data: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch {
            // ignore write errors
        }
    }
}
