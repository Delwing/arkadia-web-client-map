import Client from "./Client";

export interface ObjectData {
    desc?: string;
    hp?: number;
    attack_num?: boolean | number;
    attack_target?: boolean;
    avatar_target?: boolean;
    state?: any;
    [key: string]: any;
}

export default class ObjectManager {
    private client: Client;
    private nums: string[] = [];
    private data: Record<string, ObjectData> = {};
    private playerNum?: string;

    constructor(client: Client) {
        this.client = client;
        this.client.addEventListener('gmcp.objects.nums', (e: CustomEvent) => {
            this.handleNums(e.detail);
        });
        this.client.addEventListener('gmcp.objects.data', (e: CustomEvent) => {
            this.handleData(e.detail);
        });
        this.client.addEventListener('gmcp.char.info', (e: CustomEvent) => {
            this.handleCharInfo(e.detail);
        });
        this.client.addEventListener('gmcp.char.state', (e: CustomEvent) => {
            this.handleCharState(e.detail);
        });
    }

    private handleNums(detail: any) {
        if (Array.isArray(detail)) {
            this.nums = detail.map(String);
        } else if (detail && Array.isArray(detail.nums)) {
            this.nums = detail.nums.map(String);
        } else if (detail && Array.isArray(detail.objects)) {
            this.nums = detail.objects.map(String);
        }
    }

    private handleData(detail: Record<string, ObjectData>) {
        if (detail && typeof detail === 'object') {
            Object.keys(detail).forEach(num => {
                if (!this.data[num]) {
                    this.data[num] = {};
                }
                Object.assign(this.data[num], detail[num]);
            });
        }
    }

    private handleCharInfo(detail: any) {
        if (detail && typeof detail.object_num !== 'undefined') {
            this.playerNum = String(detail.object_num);
            if (!this.data[this.playerNum]) {
                this.data[this.playerNum] = {};
            }
            if (detail.name) {
                this.data[this.playerNum].desc = detail.name;
            }
        }
    }

    private handleCharState(detail: any) {
        if (this.playerNum && detail && typeof detail.hp !== 'undefined') {
            if (!this.data[this.playerNum]) {
                this.data[this.playerNum] = {};
            }
            this.data[this.playerNum].hp = detail.hp;
            this.data[this.playerNum].state = detail.hp;
        }
    }

    getObjectsOnLocation() {
        const objects = this.nums.map(num => {
            const obj = this.data[num] || {};
            return {
                num,
                desc: obj.desc,
                state: obj.state ?? obj.hp,
                attack_num: obj.attack_num,
                avatar_target: obj.avatar_target,
            };
        });
        if (this.playerNum) {
            const obj = this.data[this.playerNum] || {};
            objects.push({
                num: this.playerNum,
                desc: obj.desc,
                state: obj.state ?? obj.hp,
                attack_num: obj.attack_num,
                avatar_target: obj.avatar_target,
            });
        }
        return objects;
    }
}
