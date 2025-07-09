import Client from "./Client";

interface ObjectData {
    attack_num: boolean | number
    attack_target: boolean
    defense_target: boolean
    desc: string
    hp: number
    hidden: false
    living: boolean
    team: boolean
    team_leader: boolean
    avatar_target?: boolean
}

export default class TeamManager {
    private client: Client;
    private members: Set<string> = new Set();
    private leader?: string;
    private tag = 'teamManager';
    private accumulatedObjectsData = {}
    private leaderTargetNotifiedNum?: string

    constructor(client: Client) {
        this.client = client;
        this.client.addEventListener('gmcp.objects.data', (e: CustomEvent) => {
            this.handleObjectsData(e.detail);
        });
        if (typeof (this.client as any).Triggers?.registerTrigger === 'function') {
            this.registerTriggers();
        }
    }

    private handleObjectsData(data: Record<number, ObjectData>) {
        Object.assign(this.accumulatedObjectsData, data);

        Object.entries(data).forEach(([num, obj]) => {
            if (!obj || !obj.living || !obj.team) {
                return;
            }
            const name = obj.desc;
            if (!name) {
                return;
            }

            this.members.add(name);

            if (obj.team_leader) {
                if (this.leader !== name) {
                    this.leaderTargetNotifiedNum = undefined;
                }
                this.leader = name;

                if (obj.attack_target) {
                    if (obj.avatar_target !== true) {
                        if (this.leaderTargetNotifiedNum !== num) {
                            this.client.sendEvent('teamLeaderTargetNoAvatar');
                            this.leaderTargetNotifiedNum = num;
                        }
                    } else {
                        this.leaderTargetNotifiedNum = undefined;
                    }
                } else {
                    this.leaderTargetNotifiedNum = undefined;
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
            this.clearTeam();
        };
        t.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? zmusza cie do opuszczenia druzyny\.$/, clear, tag);
        t.registerTrigger(/Nie jestes w zadnej druzynie\./, clear, tag);
        t.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? rozwiazuje druzyne\.$/, clear, tag);
        t.registerTrigger(/^Porzucasz (?:swoja druzyne|druzyne, ktorej przewodzil[ea]s)\.$/, clear, tag);
        t.registerTrigger(/^Przewodzisz druzynie, w ktorej oprocz ciebie (?:jest|sa) jeszcze(?:\:|) (?<team>.*)\.$/, (_r, _l, m): undefined => {
            this.clearTeam();
            const list = m.groups?.team ?? '';
            this.parseNames(list).forEach(n => this.addMember(n));
        }, tag);
        t.registerTrigger(/^Druzyne prowadzi (?<leader>.+?)(?:, zas ty jestes jej jedynym czlonkiem| i oprocz ciebie (?:jest|sa) w niej jeszcze:? (?<team>.*))\.$/, (_r, _l, m): undefined => {
            this.clearTeam();
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

    getTeamMembers(): string[] {
        return Array.from(this.members);
    }

    isInTeam(name: string): boolean {
        return this.members.has(name);
    }

    getLeader(): string | undefined {
        return this.leader;
    }

    clearTeam() {
        this.members.clear();
        this.leader = undefined;
    }

    getAccumulatedObjectsData() {
        return this.accumulatedObjectsData
    }


}
