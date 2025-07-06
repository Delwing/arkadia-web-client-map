import ArkadiaClient from "./ArkadiaClient.ts";
import {parseAnsiPatterns} from "./ansiParser.ts";

window.Input = {
    send: ArkadiaClient.send.bind(ArkadiaClient),
}
// @ts-ignore
window.Maps = {
    refresh_position() {},
    set_position(position: Position) {
    },
    unset_position() {
    }
}
window.Gmcp = {
    parse_option_subnegotiation: (data) => data
}
// @ts-ignore
window.Output = {
    send(text: string, type?: string) {
        ArkadiaClient.emit("message", text, type)
    },
    buffer: []
}
// @ts-ignore
window.Text = {
    parse_patterns: parseAnsiPatterns
}
