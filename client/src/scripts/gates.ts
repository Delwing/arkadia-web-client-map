import Client from "../Client";
import { FunctionalBind, formatLabel } from "./functionalBind";

export default function initGates(client: Client) {
    const bind = new FunctionalBind(client, { key: "Digit2", ctrl: true, label: "CTRL+2" });
    client.addEventListener('settings', (ev: CustomEvent) => {
        const opts = ev.detail?.binds?.gates;
        if (opts) {
            bind.updateOptions({
                key: opts.key,
                ctrl: opts.ctrl,
                alt: opts.alt,
                shift: opts.shift,
                label: formatLabel(opts)
            });
        }
    });
    const knock = () => {
        Input.send("zastukaj we wrota");
    };
    bind.set(null, knock);

    const showMessage = () => {
        bind.set("zastukaj we wrota", knock);
        return undefined;
    };

    const patterns = [
        /^Probujesz otworzyc .*wrota.*/,
        /^Probujesz otworzyc .*drzwiczki.*/,
        /^Probujesz otworzyc .*krate.*/,
        /^Probujesz otworzyc .*brame.*/,
        /^Probujesz otworzyc niewielka furtke.*/,
    ];

    patterns.forEach(p => client.Triggers.registerTrigger(p, showMessage, "gates"));
}

