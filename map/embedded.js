const limit = 25;

import {MapReader, Renderer, Settings} from "mudlet-map-renderer";

class EmbeddedMap {

    constructor(mapData, colors) {
        this.destinations = []
        this.map = document.querySelector("#map");
        this.map.style.touchAction = 'none'
        this._touchStartDistance = null
        this._pinchZoom = this._pinchZoom.bind(this)
        this._onTouchStart = this._onTouchStart.bind(this)
        this._onTouchEnd = this._onTouchEnd.bind(this)
        this.map.addEventListener('touchstart', this._onTouchStart, {passive: false})
        this.map.addEventListener('touchmove', this._pinchZoom, {passive: false})
        this.map.addEventListener('touchend', this._onTouchEnd)
        this.map.addEventListener('touchcancel', this._onTouchEnd)
        this.reader = new MapReader(mapData, colors);
        this.settings = new Settings();
        this.settings.areaName = false
        this.settings.scale = 90
        this.settings.borders = true
        let zoom = 0.30
        try {
            const raw = localStorage.getItem('uiSettings')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (typeof parsed.mapScale === 'number' && parsed.mapScale > 0) {
                    zoom = parsed.mapScale
                }
            }
        } catch {
            // ignore malformed data
        }
        this.zoom = zoom

        this.renderRoomById(1)
    }

    _onTouchStart(ev) {
        if (ev.touches.length === 2) {
            const [t1, t2] = ev.touches
            this._touchStartDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        }
    }

    _onTouchEnd(ev) {
        if (ev.touches.length < 2) {
            this._touchStartDistance = null
        }
    }

    _pinchZoom(ev) {
        if (ev.touches.length === 2 && this._touchStartDistance !== null) {
            ev.preventDefault()
            const [t1, t2] = ev.touches
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
            const delta = dist / this._touchStartDistance
            this._touchStartDistance = dist
            this.setZoom(this.zoom * delta)
            this._saveZoom()
        }
    }

    _saveZoom() {
        try {
            const raw = localStorage.getItem('uiSettings')
            const parsed = raw ? JSON.parse(raw) : {}
            parsed.mapScale = this.zoom
            localStorage.setItem('uiSettings', JSON.stringify(parsed))
        } catch {}
    }

    handleMessage({type, data}) {
        switch (type) {
            case "enterLocation":
                this.renderRoomById(data.id)
                break;
            case "restoredPosition":
                this.renderRoomById(data.id)
                break;
            case "leadTo":
                this.leadTo(data)
                break;
        }
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
            this.renderer.controls.view.zoom = this.zoom;
            this.renderer.backgroundLayer.remove()

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

    setZoom(zoom) {
        this.zoom = zoom
        if (this.renderer?.controls) {
            this.renderer.controls.view.zoom = this.zoom
        }
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

const pendingMessages = []
const handleData = (data) => {
    if (window.embedded) {
        window.embedded.handleMessage(data)
    } else if (data.mapData !== undefined && data.colors !== undefined) {
        window.embedded = new EmbeddedMap(data.mapData, data.colors)
        pendingMessages.forEach(handleData)
        pendingMessages.length = 0
    } else {
        pendingMessages.push(data)
    }
}

window.addEventListener("message", (e) => handleData(e.data))
