import Client from "../Client";
import { FunctionalBind } from "./functionalBind";

export default function initGates(client: Client) {
    const bind = new FunctionalBind(client, { key: "Digit2", ctrl: true, label: "CTRL+2" });
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

