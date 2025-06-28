import Client from "./Client";

export default class TeamManager {
    private client: Client;
    private members: Set<string> = new Set();
    private leader?: string;
    private tag = 'teamManager';

    constructor(client: Client) {
        this.client = client;
        this.client.addEventListener('gmcp.objects.data', (e: CustomEvent) => {
            this.handleObjectsData(e.detail);
        });
        if (typeof (this.client as any).Triggers?.registerTrigger === 'function') {
            this.registerTriggers();
        }
    }

    private handleObjectsData(data: any) {
        let objects: any[] = [];
        if (Array.isArray(data)) {
            objects = data;
        } else if (Array.isArray(data?.objects)) {
            objects = data.objects;
        } else if (data && typeof data === 'object') {
            if (data.data && typeof data.data === 'object') {
                objects = Object.values(data.data);
            } else {
                objects = Object.values(data);
            }
        }

        if (!Array.isArray(objects)) {
            return;
        }

        objects.forEach(obj => {
            if (obj && obj.living && obj.team) {
                const name = obj.desc;
                if (name) {
                    this.members.add(name);
                    if (obj.team_leader) {
                        this.leader = name;
                    }
                }
            }
        });
    }

    private registerTriggers() {
        const t = this.client.Triggers;
        const tag = this.tag;
        t.registerTrigger(/^Zmuszasz \[?([A-Za-z][a-z ]+?)\]? do opuszczenia druzyny\.$/, (_r, _l, m): undefined => {
            this.removeMember(m[1]);
        }, tag);
        t.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? porzuca twoja druzyne\.$/, (_r, _l, m): undefined => {
            this.removeMember(m[1]);
        }, tag);
        const clear = (): undefined => {
            this.clear_team();
        };
        t.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? zmusza cie do opuszczenia druzyny\.$/, clear, tag);
        t.registerTrigger(/Nie jestes w zadnej druzynie\./, clear, tag);
        t.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? rozwiazuje druzyne\.$/, clear, tag);
        t.registerTrigger(/^Porzucasz (?:swoja druzyne|druzyne, ktorej przewodzil[ea]s)\.$/, clear, tag);
        t.registerTrigger(/^Przewodzisz druzynie, w ktorej oprocz ciebie (?:jest|sa) jeszcze(?:\:|) (?<team>.*)\.$/, (_r, _l, m): undefined => {
            this.clear_team();
            const list = m.groups?.team ?? '';
            this.parseNames(list).forEach(n => this.addMember(n));
        }, tag);
        t.registerTrigger(/^Druzyne prowadzi (?<leader>.+?)(?:, zas ty jestes jej jedynym czlonkiem| i oprocz ciebie (?:jest|sa) w niej jeszcze:? (?<team>.*))\.$/, (_r, _l, m): undefined => {
            this.clear_team();
            const leader = m.groups?.leader?.trim();
            if (leader) {
                this.leader = leader;
                this.addMember(leader);
            }
            const list = m.groups?.team;
            if (list) {
                this.parseNames(list).forEach(n => this.addMember(n));
            }
        }, tag);
    }

    private parseNames(list: string): string[] {
        return list.split(/,| i /).map(s => s.trim()).filter(Boolean);
    }

    private addMember(name: string) {
        this.members.add(name);
    }

    private removeMember(name: string) {
        this.members.delete(name);
        if (this.leader === name) {
            this.leader = undefined;
        }
    }

    get_team_members(): string[] {
        return Array.from(this.members);
    }

    is_in_team(name: string): boolean {
        return this.members.has(name);
    }

    get_leader(): string | undefined {
        return this.leader;
    }

    clear_team() {
        this.members.clear();
        this.leader = undefined;
    }
}
