const STORAGE_KEY = "scripts";

function loadScripts(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch {}
    return [];
}

export default function initExternalScripts() {
    const loaded: Record<string, HTMLScriptElement> = {};

    const apply = (list: string[] = []) => {
        Object.keys(loaded).forEach(url => {
            if (!list.includes(url)) {
                loaded[url].remove();
                delete loaded[url];
            }
        });
        list.forEach(url => {
            if (!loaded[url]) {
                const script = document.createElement("script");
                script.src = url;
                document.head.appendChild(script);
                loaded[url] = script;
            }
        });
    };

    apply(loadScripts());

    window.addEventListener("storage", (ev: StorageEvent) => {
        if (ev.key === STORAGE_KEY) {
            try {
                const list = ev.newValue ? JSON.parse(ev.newValue) : [];
                if (Array.isArray(list)) {
                    apply(list);
                }
            } catch {}
        }
    });
}
