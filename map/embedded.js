let limit = 25;

import {MapReader, Renderer, Settings} from "mudlet-map-renderer";

class EmbeddedMap {

    constructor(mapData, colors, startId) {
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
                if (typeof parsed.mapLimit === 'number' && parsed.mapLimit > 0) {
                    limit = parsed.mapLimit
                }
            }
        } catch {
            // ignore malformed data
        }
        this.zoom = zoom
        this.limit = limit
        this.renderer = new Renderer(this.map, this.reader, this.settings)
        this.renderRoomById(startId)

        window.addEventListener('enterLocation', (ev) => {
            this.renderRoomById(ev.detail.id);
        })

        window.addEventListener('leadTo', (ev) => {
            this.leadTo(ev.detail);
        })
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

    _saveLimit() {
        try {
            const raw = localStorage.getItem('uiSettings')
            const parsed = raw ? JSON.parse(raw) : {}
            parsed.mapLimit = this.limit
            localStorage.setItem('uiSettings', JSON.stringify(parsed))
        } catch {}
    }

    renderRoomById(id) {
        this.renderRoom(this.reader.getRoomById(id));
    }

    renderRoom(room) {
        if (room) {
            const area = this.reader.getAreaByRoomId(room.id, {
                xMin: room.x - this.limit,
                xMax: room.x + this.limit,
                yMin: room.y - this.limit,
                yMax: room.y + this.limit
            });
            this.renderer?.clear();
            this.renderer.renderArea(area)
            this.renderer.controls.centerRoom(room.id);
            this.renderer.controls.setZoom(this.zoom)
            this.renderer.backgroundLayer.remove()

            this.currentRoom = room;
            const label = document.getElementById('location-label');
            if (label && area) {
                label.textContent = `#${room.id} ${area.areaName}`;
            }

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
            this.renderer.controls.setZoom(this.zoom)
        }
    }

    setLimit(newLimit) {
        this.limit = newLimit
        this.refresh()
        this._saveLimit()
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

const createMap = (data) => {
    window.embedded = new EmbeddedMap(data.mapData, data.colors, data.startId ?? 1)
}

window.addEventListener('map-ready-with-data', (e) => createMap(e.detail))
