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
    private attackTargetId?: string
    private defenseTargetId?: string
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
        Object.entries(data).forEach(([id, obj]) => {
            this.accumulatedObjectsData[id] = { ...(this.accumulatedObjectsData as any)[id], ...obj };

            if (typeof obj.attack_target === 'boolean') {
                if (obj.attack_target) {
                    this.attackTargetId = id;
                } else if (this.attackTargetId === id) {
                    this.attackTargetId = undefined;
                }
            }

            if (typeof obj.defense_target === 'boolean') {
                if (obj.defense_target) {
                    this.defenseTargetId = id;
                } else if (this.defenseTargetId === id) {
                    this.defenseTargetId = undefined;
                }
            }

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
        });
    }

    private registerTriggers() {
        const triggers = this.client.Triggers;
        const tag = this.tag;
        triggers.registerTrigger(/^Zmuszasz \[?([A-Za-z][a-z ]+?)\]? do opuszczenia druzyny\.$/, (_r, _l, m): undefined => {
            this.removeMember(m[1]);
        }, tag);
        triggers.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? porzuca twoja druzyne\.$/, (_r, _l, m): undefined => {
            this.removeMember(m[1]);
        }, tag);
        const clear = (): undefined => {
            this.clearTeam();
        };
        triggers.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? zmusza cie do opuszczenia druzyny\.$/, clear, tag);
        triggers.registerTrigger(/Nie jestes w zadnej druzynie\./, clear, tag);
        triggers.registerTrigger(/^\[?([A-Z][a-z ]+?)\]? rozwiazuje druzyne\.$/, clear, tag);
        triggers.registerTrigger(/^Porzucasz (?:swoja druzyne|druzyne, ktorej przewodzil[ea]s)\.$/, clear, tag);
        triggers.registerTrigger(/^Przewodzisz druzynie, w ktorej oprocz ciebie (?:jest|sa) jeszcze(?:\:|) (?<team>.*)\.$/, (_r, _l, m): undefined => {
            this.clearTeam();
            const list = m.groups?.team ?? '';
            this.parseNames(list).forEach(n => this.addMember(n));
        }, tag);
        triggers.registerTrigger(/^Druzyne prowadzi (?<leader>.+?)(?:, zas ty jestes jej jedynym czlonkiem| i oprocz ciebie (?:jest|sa) w niej jeszcze:? (?<team>.*))\.$/, (_r, _l, m): undefined => {
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
        triggers.registerTrigger(/^Dolaczasz do druzyny/, (): undefined => {
            this.client.sendGMCP("objects.nums")
            this.client.sendGMCP("objects.data")
        })
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

    getAttackTargetId() {
        return this.attackTargetId;
    }

    getDefenseTargetId() {
        return this.defenseTargetId;
    }


}
