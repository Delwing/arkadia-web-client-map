import Client from "@client/src/Client";

export default class ObjectList {
    private client: Client;
    private container: HTMLElement | null;

    constructor(client: Client) {
        this.client = client;
        this.container = document.getElementById("objects-list");
        this.client.addEventListener("gmcp.objects.nums", () => this.render());
        this.client.addEventListener("gmcp.objects.data", () => this.render());
        this.client.addEventListener("gmcp.char.state", () => this.render());
        this.render();
    }

    private render() {
        if (!this.container) return;
        const manager = (window as any).clientExtension?.ObjectManager;
        if (!manager) return;
        const objects = manager.getObjectsOnLocation();
        const lines = objects.map((obj: any) => {
            const num = obj.num;
            const desc = obj.desc || "";
            let bar = "";
            if (typeof obj.state === "number") {
                const hp = Math.max(0, Math.min(6, obj.state));
                bar = `[${"#".repeat(hp)}${"-".repeat(6 - hp)}]`;
            }
            const attackers = objects
                .filter((o: any) => o.attack_num === num)
                .map((o: any) => o.num);
            const arrow = attackers.length ? ` <- ${attackers.join(" ")}` : "";
            return `${num} ${desc} ${bar}${arrow}`.trim();
        });
        this.container.textContent = lines.join("\n");
    }
}
