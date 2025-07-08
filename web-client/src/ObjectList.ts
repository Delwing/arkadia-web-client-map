import Client from "@client/src/Client";

export default class ObjectList {
    private client: Client;
    private readonly container: HTMLElement | null;
    private isDragging = false;
    private startX = 0;
    private startY = 0;
    private offsetRight = 0;
    private offsetTop = 0;
    private pointerId = 0;

    constructor(client: Client) {
        this.client = client;
        this.container = document.getElementById("objects-list");
        this.setupDraggable();
        this.client.addEventListener("gmcp.objects.nums", () => this.render());
        this.client.addEventListener("gmcp.objects.data", () => this.render());
        this.client.addEventListener("gmcp.char.state", () => this.render());
        this.render();
    }

    private setupDraggable() {
        if (!this.container) return;

        const saved = localStorage.getItem("objectsListPosition");
        if (saved) {
            try {
                const { x, y } = JSON.parse(saved);
                this.container.style.right = `${x}px`;
                this.container.style.top = `${y}px`;
            } catch (e) {
                console.error("Error parsing saved objects list position", e);
            }
        }

        this.container.addEventListener("pointerdown", this.onPointerDown);
        window.addEventListener("pointermove", this.onPointerMove);
        window.addEventListener("pointerup", this.onPointerUp);
    }

    private onPointerDown = (e: PointerEvent) => {
        if (!this.container) return;
        this.isDragging = true;
        this.pointerId = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;
        const rect = this.container.getBoundingClientRect();
        this.offsetRight = window.innerWidth - rect.right;
        this.offsetTop = rect.top;
        this.container.setPointerCapture(this.pointerId);
        e.preventDefault();
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.isDragging || !this.container || e.pointerId !== this.pointerId) return;

        const deltaX = this.startX - e.clientX;
        const deltaY = e.clientY - this.startY;
        const newRight = this.offsetRight + deltaX;
        const newTop = this.offsetTop + deltaY;
        this.container.style.right = `${Math.max(0, newRight)}px`;
        this.container.style.top = `${Math.max(0, newTop)}px`;
    };

    private onPointerUp = (e: PointerEvent) => {
        if (!this.isDragging || !this.container || e.pointerId !== this.pointerId) return;
        this.isDragging = false;
        this.container.releasePointerCapture(this.pointerId);
        const rect = this.container.getBoundingClientRect();
        const position = {
            x: window.innerWidth - rect.right,
            y: rect.top,
        };
        localStorage.setItem("objectsListPosition", JSON.stringify(position));
    };

    private render() {
        if (!this.container) return;
        const manager = (window as any).clientExtension?.ObjectManager;
        if (!manager) return;
        const objects = manager.getObjectsOnLocation();
        const numWidth = Math.max(0, ...objects.map((o: any) => String(o.num).length));
        const descWidth = Math.max(0, ...objects.map((o: any) => (o.desc || "").length));
        const lines = objects.map((obj: any) => {
            const num = String(obj.num).padStart(numWidth, " ");
            let prefix = " ";
            if (obj.attack_target) {
                prefix = ">";
            } else if (obj.defense_target) {
                prefix = "*";
            }
            const numLabel = `${prefix}${num}`;
            const rawDesc = obj.desc || "";
            let coloredDesc = rawDesc;
            if (obj.avatar_target) {
                coloredDesc = `<span style="color:#ffaaaa">${rawDesc}</span>`;
            }
            const desc = coloredDesc + " ".repeat(Math.max(0, descWidth - rawDesc.length));
            let bar = "";
            if (typeof obj.state === "number") {
                const hp = Math.max(0, Math.min(6, obj.state));
                const color = hp < 3 ? "tomato" : "springgreen";
                const filled = "#".repeat(hp + 1);
                const empty = "-".repeat(6 - hp);
                bar = `[<span style="color:${color}">${filled}${empty}</span>]`;
            }
            const attackers = objects
                .filter((o: any) => o.attack_num === obj.num)
                .map((o: any) => o.shortcut);
            const arrow = attackers.length ? ` <- ${attackers.join(" ")}` : "";
            return `${obj.shortcut} ${desc} ${bar}${arrow}`.trimEnd();
        });
        this.container.innerHTML = lines.join("<br>");
    }
}
