const limit = 20;

import {MapReader, Renderer, Settings} from "mudlet-map-renderer";

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

function getLongDir(dir) {
    return polishToEnglish[dir] ?? exits[dir] ?? dir;
}

function getShortDir(dir) {
    return longToShort[dir] ?? dir;
}

class EmbeddedMap {

    constructor(mapData, colors) {
        this.event = new EventTarget();
        this.locationHistory = []
        this.gmcpPosition = {};
        this.destinations = []
        this.map = document.querySelector("#map");
        this.reader = new MapReader(mapData, colors);
        this.settings = new Settings();
        this.settings.areaName = false

        this.hashes = {};
        Object.values(this.reader.roomIndex).forEach(room => this.hashes[room.hash] = room);

        this.renderRoomById(1)
        this.refreshPosition = true;

        window.addEventListener("message", (e) => {
            const {type, data} = e.data
            switch (type) {
                case "gmcp.room.info":
                    this.gmcpPosition = data.map;
                    if (this.refreshPosition) {
                        this.setMapPosition(this.gmcpPosition)
                        this.refreshPosition = false
                    }
                    break
                case "refreshPosition":
                    this.setMapPosition(this.gmcpPosition);
                    break;
                case "command":
                    this.sendMessage("command", this.parseCommand(data))
                    break;
                case "moveBack":
                    this.moveBack()
                    break;
                case "setPosition":
                    this.setMapRoomById(data)
                    break;
                case "move":
                    this.move(data)
                    break;
                case "leadTo":
                    this.leadTo(data)
                    break;
                case 'refreshPositionWhenAble':
                    this.refreshPosition = true
                    break;
            }
        });

        this.event.addEventListener('onRoom', ({detail: room}) => {
            if (room.userData.bind) {
                this.sendMessage("bindButton", {
                    Name: room.userData.bind,
                    Replacement: room.userData.bind,
                    Panel: "bottom",
                    BindButton: true
                },)
            } else {
                this.sendMessage("clearBindButton")
            }
        })
    }

    sendMessage(type, payload) {
        parent.postMessage({
            type: type,
            payload: payload
        }, "https://arkadia.rpg.pl");
    }

    renderRoomById(id) {
        this.renderRoom(this.reader.getRoomById(id));
    }

    renderRoom(room) {
        if (room) {
            const area = this.reader.getAreaByRoomId(room.id, {
                xMin: room.x - limit,
                xMax: room.x + limit,
                yMin: room.y - limit,
                yMax: room.y + limit
            });
            this.renderer?.clear();
            this.renderer = new Renderer(this.map, this.reader, area, this.reader.getColors(), this.settings);
            this.renderer.controls.centerRoom(room.id);
            this.renderer.controls.view.zoom = 0.35;

            this.currentRoom = room;
            this.event.dispatchEvent(new CustomEvent('onRoom', {detail: room}))

            if (this.destinations.indexOf(room.id) > -1) {
                this.destinations.splice(this.destinations.indexOf(room.id), 1)
            }

            this.destinations.forEach(destination => {
                this.renderer.controls.renderPath(room.id, destination)
            })
        }
    }

    parseCommand(command) {
        if (command === "zerknij" || command === "spojrz" || command === "sp") {
            this.refreshPosition = true;
        }
        return this.move(command) ?? command;
    }

    move(direction) {
        let actualDirection = direction
        if (this.currentRoom) {
            if (this.currentRoom.userData.dir_bind) {
                const dirBinds = Object.fromEntries(this.currentRoom.userData.dir_bind.split("&").map(item => item.split("=")))
                if (dirBinds[getLongDir(actualDirection)]) {
                    direction = dirBinds[getLongDir(actualDirection)]
                    return direction
                }
            }
            const allExits = Object.assign({}, this.currentRoom.exits, this.currentRoom.specialExits);
            const potentialExit = getLongDir(direction);
            if (!this.currentRoom.exits[potentialExit]) {
                const exits = Object.entries(allExits).filter(([exit, id]) => {
                    const target = this.reader.getRoomById(id);
                    return this.findRoomByExit(this.currentRoom, target, getLongDir(direction));
                }).map(([exit]) => exit);
                if (exits.length > 0) {
                    actualDirection = getShortDir(exits[0]);
                }
            }

            const locationId = allExits[getLongDir(actualDirection)]
            this.locationHistory.push(locationId)
            this.renderRoomById(locationId);
            this.sendMessage('enterLocation', locationId)
        }
        return actualDirection;
    }

    refresh() {
        this.renderRoom(this.currentRoom)
    }

    setMapPosition(data) {
        if (data && data.x && data.y && data.id && data.name) {
            const hash = `${data.x}:${data.y}:0:${data.name}`;
            const room = this.hashes[hash];
            this.setMapRoom(room)
        }
    }

    setMapRoomById(id) {
        this.setMapRoom(this.reader.getRoomById(id))
    }

    setMapRoom(room) {
        this.renderRoom(room);
        this.locationHistory = [room.id]
    }

    leadTo(id) {
        if (id) {
            this.destinations.push(parseInt(id))
        } else {
            this.destinations = []
        }
        this.refresh()
    }

    findRoomByExit(room, targetRoom, targetDir) {
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

    moveBack() {
        this.locationHistory.pop()
        this.renderRoomById(this.locationHistory[this.locationHistory.length - 1])
    }

}

const loadListener = (event) => {
    if (event.data.mapData !== undefined && event.data.colors !== undefined) {
        window.embedded = new EmbeddedMap(event.data.mapData, event.data.colors)
    }
}
window.addEventListener("message", loadListener)
