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
        const numWidth = Math.max(0, ...objects.map((o: any) => String(o.num).length));
        const descWidth = Math.max(0, ...objects.map((o: any) => (o.desc || "").length));
        const lines = objects.map((obj: any) => {
            const num = String(obj.num).padStart(numWidth, " ");
            const desc = (obj.desc || "").padEnd(descWidth, " ");
            let bar = "";
            if (typeof obj.state === "number") {
                const hp = Math.max(0, Math.min(6, obj.state));
                bar = `[${"#".repeat(hp + 1)}${"-".repeat(6 - hp)}]`;
            }
            const attackers = objects
                .filter((o: any) => o.attack_num === obj.num)
                .map((o: any) => o.shortcut);
            const arrow = attackers.length ? ` <- ${attackers.join(" ")}` : "";
            return `${obj.shortcut} ${desc} ${bar}${arrow}`.trimEnd();
        });
        this.container.textContent = lines.join("\n");
    }
}
