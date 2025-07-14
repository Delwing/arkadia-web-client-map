import Client from "../Client";

const STORAGE_KEY = "scripts";

export default function initExternalScripts(client: Client) {
    const loaded: Record<string, HTMLScriptElement> = {};
    let known: string[] = [];

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

    const param = new URLSearchParams(window.location.search).get("add-script");
    let handled = false;

    const checkParam = () => {
        if (handled || !param) return;
        handled = true;
        if (!known.includes(param)) {
            known.push(param);
            client.port?.postMessage({
                type: "SET_STORAGE",
                key: STORAGE_KEY,
                value: known,
            });
            apply(known);
        }
        const params = new URLSearchParams(window.location.search);
        params.delete("add-script");
        const base = window.location.origin + window.location.pathname;
        const rest = params.toString();
        window.location.replace(rest ? `${base}?${rest}` : base);
    };

    client.addEventListener("storage", (ev: CustomEvent) => {
        if (ev.detail.key === STORAGE_KEY) {
            known = Array.isArray(ev.detail.value) ? ev.detail.value : [];
            apply(known);
            checkParam();
        }
    });

    client.port?.postMessage({ type: "GET_STORAGE", key: STORAGE_KEY });
    if (!param) {
        // ensure scripts are applied even if storage event doesn't fire
        apply([]);
    }
    checkParam();
}
