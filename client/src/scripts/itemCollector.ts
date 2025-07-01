import Client from "../Client";

export default class ItemCollector {
    private client: Client;

    modes = [
        "monety",
        "kamienie",
        "monety i kamienie",
        "druzynowe monety",
        "druzynowe kamienie",
        "druzynowe monety i kamienie",
        "nic",
    ];

    typeModes = ["wszystkie", "srebrne", "zlote"];

    moneyType = 1;
    currentMode = 3;
    extra: string[] = [];

    constructor(client: Client) {
        this.client = client;
        window.addEventListener("keydown", (ev) => {
            if (ev.ctrlKey && ev.code === "Digit3") {
                this.keyPressed(true);
                ev.preventDefault();
            }
        });
        this.client.addEventListener("settings", (ev: CustomEvent) => {
            const s = ev.detail || {};
            if (typeof s.collectMode === "number") {
                this.setMode(s.collectMode);
            }
            if (typeof s.collectMoneyType === "number") {
                this.setMoneyMode(s.collectMoneyType);
            }
            if (Array.isArray(s.collectExtra)) {
                this.extra = [...s.collectExtra];
            }
        });
    }

    setMode(mode: number) {
        if (this.modes[mode - 1]) {
            this.currentMode = mode;
        }
    }

    setMoneyMode(mode: number) {
        if (this.typeModes[mode - 1]) {
            this.moneyType = mode;
        }
    }

    keyPressed(force = false, index?: number) {
        const from = index != null ? `${index}. ciala` : "ciala";
        if (force) {
            if ([1, 3, 4, 6].includes(this.currentMode)) {
                if (this.moneyType === 1) {
                    Input.send(`wez monety z ${from}`);
                } else if (this.moneyType === 2) {
                    Input.send(`wez srebrne monety z ${from}`);
                    Input.send(`wez zlote monety z ${from}`);
                } else if (this.moneyType === 3) {
                    Input.send(`wez zlote monety z ${from}`);
                }
            }
            if ([2, 3, 5, 6].includes(this.currentMode)) {
                Input.send(`wez kamienie z ${from}`);
                Input.send("ocen kamienie");
            }
            this.extra.forEach((it) => Input.send(`wez ${it} z ${from}`));
        }
    }

    addExtra(item: string) {
        if (item) {
            this.extra.push(item);
        }
    }

    removeExtra(item?: string, clearAll?: boolean) {
        if (clearAll) {
            this.extra = [];
            return;
        }
        if (item) {
            this.extra = this.extra.filter((e) => e !== item);
        }
    }
}
