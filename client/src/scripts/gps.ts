import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";

interface GpsEntry {
    gps_string_lines: string[];
    line_delta?: number;
    area_name?: string;
    room_id: number;
    within_room_ids?: number[];
}

export default function initGps(client: Client) {
    const COLOR = findClosestColor("#ffa500");

    function register(mapData: MapData.Map) {
        mapData.forEach(area => {
            area.rooms.forEach(room => {
                const raw = room.userData?.gps;
                if (!raw) {
                    return;
                }
                let entries: GpsEntry[];
                try {
                    entries = JSON.parse(raw);
                } catch {
                    return;
                }
                entries.forEach((entry, idx) => {
                    const lines = entry.gps_string_lines;
                    if (!lines || lines.length === 0) {
                        return;
                    }
                    const delta = entry.line_delta ? Number(entry.line_delta) - 1 : lines.length - 1;
                    const gpsId = `${room.id}_${idx}`;
                    let current = 1;
                    const checkContext = () => {
                        if (entry.area_name && client.Map.currentRoom?.areaId !== entry.area_name) {
                            return false;
                        }
                        if (entry.within_room_ids && entry.within_room_ids.length > 0) {
                            const id = client.Map.currentRoom?.id;
                            if (!id || !entry.within_room_ids.includes(id)) {
                                return false;
                            }
                        }
                        return true;
                    };
                    const parent = client.Triggers.registerTrigger(
                        lines[0],
                        () => {
                            if (!checkContext()) {
                                return;
                            }
                            if (lines.length === 1) {
                                client.Map.setMapRoomById(room.id);
                                client.println(colorString(` Map Sync: gps ${gpsId}`, COLOR));
                            } else {
                                current = 1;
                            }
                            return undefined;
                        },
                        "gps",
                        { stayOpenLines: delta }
                    );
                    if (lines.length > 1) {
                        parent.registerChild((_, line) => {
                            if (!checkContext()) {
                                return undefined;
                            }
                            if (line === lines[current]) {
                                current++;
                                if (current === lines.length) {
                                    client.Map.setMapRoomById(room.id);
                                    client.println(colorString(` Map Sync: gps ${gpsId}`, COLOR));
                                    current = 1;
                                }
                                return [line];
                            }
                            return undefined;
                        });
                    }
                });
            });
        });
    }

    window.addEventListener('map-ready', (ev: CustomEvent) => {
        register(ev.detail.mapData);
    });
}
