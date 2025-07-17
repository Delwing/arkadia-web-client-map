const limit = 25;

import {MapReader, Renderer, Settings} from "mudlet-map-renderer";

class EmbeddedMap {

    constructor(mapData, colors, startId) {
        this.destinations = []
        this.map = document.querySelector("#map");
        this.map.style.touchAction = 'none'
        this._longPressTimer = null
        this._longPressActive = false
        this._debugTimerEl = document.getElementById('timer')
        this._touchPointEl = document.getElementById('touch-point')
        this._debugInterval = null
        this._longPressStartX = 0
        this._longPressStartY = 0
        this._touchStartDistance = null
        this._pinchZoom = this._pinchZoom.bind(this)
        this._onTouchStart = this._onTouchStart.bind(this)
        this._onTouchEnd = this._onTouchEnd.bind(this)
        this._onLongPressStart = this._onLongPressStart.bind(this)
        this._onLongPressMove = this._onLongPressMove.bind(this)
        this._onLongPressEnd = this._onLongPressEnd.bind(this)
        this.map.addEventListener('touchstart', this._onTouchStart, {passive: false})
        this.map.addEventListener('touchmove', this._pinchZoom, {passive: false})
        this.map.addEventListener('touchend', this._onTouchEnd)
        this.map.addEventListener('touchcancel', this._onTouchEnd)
        this.map.addEventListener('touchstart', this._onLongPressStart)
        this.map.addEventListener('touchmove', this._onLongPressMove)
        this.map.addEventListener('touchend', this._onLongPressEnd)
        this.map.addEventListener('touchcancel', this._onLongPressEnd)
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

        this.renderRoomById(startId)

        window.addEventListener('enterLocation', (ev) => {
            this.renderRoomById(ev.detail.id);
        })

        window.addEventListener('leadTo', (ev) => {
            this.leadTo(ev.detail);
        })
    }

    _onLongPressStart(ev) {
        if (ev.touches.length !== 1 || !this.renderer) {
            return;
        }
        const touch = ev.touches[0];
        this._longPressActive = true;
        this._longPressStartX = touch.clientX;
        this._longPressStartY = touch.clientY;
        if (this._touchPointEl) {
            this._touchPointEl.style.display = 'block'
            this._touchPointEl.style.left = `${touch.clientX - 10}px`
            this._touchPointEl.style.top = `${touch.clientY - 10}px`
        }
        if (this._debugTimerEl) {
            this._debugTimerEl.style.display = 'block'
            this._debugTimerEl.textContent = '500'
        }
        const start = Date.now()
        if (this._debugTimerEl) {
            this._debugInterval = window.setInterval(() => {
                const remaining = 500 - (Date.now() - start)
                if (remaining <= 0) {
                    clearInterval(this._debugInterval)
                    this._debugInterval = null
                }
                this._debugTimerEl.textContent = Math.max(0, remaining).toString()
            }, 50)
        }
        this._longPressTimer = window.setTimeout(() => {
            if (!this._longPressActive) return;
            this._longPressActive = false;
            const rect = this.map.getBoundingClientRect();
            const x = this._longPressStartX - rect.left;
            const y = this._longPressStartY - rect.top;
            const paper = this.renderer.paper;
            const view = this.renderer.controls.view;
            const point = view.viewToProject(new paper.Point(x, y));
            const room = this.renderer.area.rooms.find(r => r.render && r.render.contains(point));
            if (room) {
                const ce = (window.parent && window.parent.clientExtension) || window.clientExtension;
                ce?.Map?.setMapRoomById?.(room.id);
            }
            if (this._touchPointEl) this._touchPointEl.style.display = 'none'
            if (this._debugTimerEl) this._debugTimerEl.style.display = 'none'
        }, 500);
    }

    _onLongPressMove(ev) {
        if (!this._longPressActive || ev.touches.length !== 1) return;
        const touch = ev.touches[0];
        const dx = touch.clientX - this._longPressStartX;
        const dy = touch.clientY - this._longPressStartY;
        if (Math.hypot(dx, dy) > 10) {
            this._onLongPressEnd();
        }
    }

    _onLongPressEnd() {
        this._longPressActive = false;
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
        if (this._debugInterval) {
            clearInterval(this._debugInterval)
            this._debugInterval = null
        }
        if (this._touchPointEl) this._touchPointEl.style.display = 'none'
        if (this._debugTimerEl) this._debugTimerEl.style.display = 'none'
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

const createMap = (data) => {
    window.embedded = new EmbeddedMap(data.mapData, data.colors, data.startId)
}

window.addEventListener('map-ready-with-data', (e) => createMap(e.detail))
