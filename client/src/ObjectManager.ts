import Client from "./Client";

export interface ObjectData {
    desc?: string;
    hp?: number;
    attack_num?: boolean | number;
    attack_target?: boolean;
    state?: any;
    [key: string]: any;
}

export default class ObjectManager {
    private client: Client;
    private nums: string[] = [];
    private data: Record<string, ObjectData> = {};

    constructor(client: Client) {
        this.client = client;
        this.client.addEventListener('gmcp.object.nums', (e: CustomEvent) => {
            this.handleNums(e.detail);
        });
        this.client.addEventListener('gmcp.objects.data', (e: CustomEvent) => {
            this.handleData(e.detail);
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
            Object.assign(this.data, detail);
        }
    }

    getObjectsOnLocation() {
        return this.nums.map(num => {
            const obj = this.data[num] || {};
            return {
                num,
                desc: obj.desc,
                state: obj.state ?? obj.hp,
                attack_target: obj.attack_target,
            };
        });
    }
}
