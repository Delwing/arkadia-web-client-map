import Client from "../Client";

const STORAGE_KEY = "scripts";

export default function initExternalScripts(client: Client) {
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

    client.addEventListener("storage", (ev: CustomEvent) => {
        if (ev.detail.key === STORAGE_KEY) {
            apply(ev.detail.value || []);
        }
    });
}
