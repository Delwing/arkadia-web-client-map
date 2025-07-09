import {MapReader} from "mudlet-map-renderer";
import Client from "./Client";
import Room = MapData.Room;

const STORAGE_KEY = 'mapperRoomId';

const polishToEnglish = {
    ["polnoc"]: "north",
    ["poludnie"]: "south",
    ["wschod"]: "east",
    ["zachod"]: "west",
    ["polnocny-wschod"]: "northeast",
    ["polnocny-zachod"]: "northwest",
    ["poludniowy-wschod"]: "southeast",
    ["poludniowy-zachod"]: "southwest",
    ["dol"]: "down",
    ["gora"]: "up",
    ["gore"]: "up"
};
const longToShort = {
    north: "n",
    south: "s",
    east: "e",
    west: "w",
    northeast: "ne",
    northwest: "nw",
    southeast: "se",
    southwest: "sw",
    up: "u",
    down: "d"
};

const exits = {
    "e": "east",
    "w": "west",
    "n": "north",
    "s": "south",
    "sw": "southwest",
    "se": "southeast",
    "nw": "northwest",
    "ne": "northeast",
    "u": "up",
    "d": "down"
};

function getLongDir(dir: string): string {
    return polishToEnglish[dir] ?? exits[dir] ?? dir;
}

function getShortDir(dir: string): string {
    return longToShort[dir] ?? dir;
}

export default class MapHelper {

    currentRoom: Room;
    locationHistory: number[] = []
    client: Client
    drinkableButton
    mapReader
    refreshPosition = true;
    hashes = {};
    gmcpPosition: Position;
    roomBind: HTMLInputElement
    savedRoomId: number | null = null;

    constructor(clientExtension: Client) {
        this.client = clientExtension
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            this.savedRoomId = parseInt(saved);
        }
        this.client.addEventListener('enterLocation', (event) => this.handleNewLocation(event.detail))
        window.addEventListener('map-ready', (event: CustomEvent) => {
            this.mapReader = new MapReader(event.detail.mapData, event.detail.colors)
            // @ts-ignore
            Object.values(this.mapReader.roomIndex).forEach(room => this.hashes[room.hash] = room);
            const startId = this.savedRoomId ?? 1;
            this.renderRoomById(startId, false)
        })

        this.client.addEventListener('gmcp.room.info', (event: CustomEvent) => {
            this.gmcpPosition = event.detail.map;
            if (this.refreshPosition) {
                this.setMapPosition(this.gmcpPosition)
                this.refreshPosition = false
            }
        })

        this.client.addEventListener('refreshPositionWhenAble', () => {
            this.refreshPosition = true;
        });
    }

    parseCommand(command) {
        if (command === "zerknij" || command === "spojrz" || command === "sp") {
            this.refreshPosition = true;
        }
        return this.move(command) ?? command;
    }

    move(direction: string) {
        let actualDirection = direction
        if (this.currentRoom) {
            if (this.currentRoom.userData.dir_bind) {
                const dirBinds = Object.fromEntries(this.currentRoom.userData.dir_bind.split("&").map((item: string) => item.split("=")))
                if (dirBinds[getLongDir(actualDirection)]) {
                    direction = dirBinds[getLongDir(actualDirection)]
                    return direction
                }
            }
            const allExits = Object.assign(
                {},
                this.currentRoom.exits ?? {},
                this.currentRoom.specialExits ?? {}
            );
            const potentialExit = getLongDir(direction);
            if (!this.currentRoom.exits || !this.currentRoom.exits[potentialExit]) {
                const exits = Object.entries(allExits).filter(([_, id]) => {
                    const target = this.mapReader.getRoomById(id);
                    return this.findRoomByExit(this.currentRoom, target, getLongDir(direction));
                }).map(([exit]) => exit);
                if (exits.length > 0) {
                    actualDirection = getShortDir(exits[0]);
                }
            }

            const locationId = allExits[getLongDir(actualDirection)]
            if (locationId) {
                this.locationHistory.push(locationId)
                this.renderRoomById(locationId);
            }
        }
        return actualDirection;
    }

    refresh() {
        this.renderRoom(this.currentRoom)
    }

    setMapPosition(data: Position) {
        if (data && data.x && data.y && data.name) {
            const hash = `${data.x}:${data.y}:0:${data.name}`;
            const room = this.hashes[hash];
            this.setMapRoom(room)
        }
    }

    setMapRoomById(id: number) {
        this.setMapRoom(this.mapReader.getRoomById(id))
    }

    setMapRoom(room: Room) {
        this.locationHistory = [room.id]
        this.renderRoom(room);
    }

    moveBack() {
        this.locationHistory.pop()
        if (!this.locationHistory[this.locationHistory.length - 1]) {
            return
        }
        this.renderRoomById(this.locationHistory[this.locationHistory.length - 1])
    }

    renderRoom(room: Room) {
        this.renderRoomById(room.id)
    }

    renderRoomById(id: number, sendEvent = true) {
        this.currentRoom = this.mapReader.getRoomById(id)
        localStorage.setItem(STORAGE_KEY, id.toString())
        if (sendEvent) {
            this.client.sendEvent('enterLocation', {id: id, room: this.currentRoom});
        }
    }

    findRoomByExit(room: Room, targetRoom: Room, targetDir: string) {
        const x = targetRoom.x;
        const y = targetRoom.y;
        const z = targetRoom.z;
        const c_x = room.x;
        const c_y = room.y;
        const c_z = room.z;

        if (targetDir === "south") {
            return x === c_x && y < c_y && z === c_z;
        }
        if (targetDir === "north") {
            return x === c_x && y > c_y && z === c_z;
        }
        if (targetDir === "east") {
            return x > c_x && y === c_y && z === c_z;
        }
        if (targetDir === "west") {
            return x < c_x && y === c_y && z === c_z;
        }
        if (targetDir === "northwest") {
            return x < c_x && y > c_y && z === c_z;
        }
        if (targetDir === "northeast") {
            return x > c_x && y > c_y && z === c_z;
        }
        if (targetDir === "southwest") {
            return x < c_x && y < c_y && z === c_z;
        }
        if (targetDir === "southeast") {
            return x > c_x && y < c_y && z === c_z;
        }
        if (targetDir === "down") {
            return x === c_x && y === c_y && z < c_z;
        }
        if (targetDir === "up") {
            return x === c_x && y === c_y && z > c_z;
        }
    }

    handleNewLocation({room: room}) {
        this.client.FunctionalBind.clear();

        if (room.userData?.bind) {
            this.client.FunctionalBind.set(room.userData?.bind, () => Input.send(room.userData?.bind))
        } else if (room.userData?.drinkable) {
            this.client.FunctionalBind.set("napij sie do syta wody", () => Input.send("napij sie do syta wody"))
        }


    }

}