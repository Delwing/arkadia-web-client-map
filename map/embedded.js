const limit = 25;

import {MapReader, Renderer, Settings} from "mudlet-map-renderer";

class EmbeddedMap {

    constructor(mapData, colors) {
        this.destinations = []
        this.map = document.querySelector("#map");
        this.reader = new MapReader(mapData, colors);
        this.settings = new Settings();
        this.settings.areaName = false

        this.renderRoomById(1)

        window.addEventListener("message", (e) => {
            const {type, data} = e.data
            switch (type) {
                case "enterLocation":
                    this.renderRoomById(data.id)
                    break;
                case "leadTo":
                    this.leadTo(data)
                    break;
            }
        });
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
            this.renderer.controls.view.zoom = 0.30;

            this.currentRoom = room;

            if (this.destinations.indexOf(room.id) > -1) {
                this.destinations.splice(this.destinations.indexOf(room.id), 1)
            }

            this.destinations.forEach(destination => {
                this.renderer.controls.renderPath(room.id, destination)
            })
        }
    }

    refresh() {
        this.renderRoom(this.currentRoom)
    }

    leadTo(id) {
        if (id) {
            this.destinations.push(parseInt(id))
        } else {
            this.destinations = []
        }
        this.refresh()
    }

}

const loadListener = (event) => {
    if (event.data.mapData !== undefined && event.data.colors !== undefined) {
        window.embedded = new EmbeddedMap(event.data.mapData, event.data.colors)
    }
}
window.addEventListener("message", loadListener)
