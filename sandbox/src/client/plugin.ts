import ArkadiaClient from "./ArkadiaClient.ts";
import {parseAnsiPatterns} from "./ansiParser.ts";

window.Input = {
    send: ArkadiaClient.send.bind(ArkadiaClient),
}
window.Maps = {}
window.Gmcp = {
    parse_option_subnegotiation: (data) => data
}
window.Output = {
    send(text: string) {
        ArkadiaClient.emit("message", text)
    },
    buffer: [],
    flush_buffer: () => {
        if (window.Output.buffer.length > 0) {
            console.log("BUFFER NOT EMPTY", window.Output.buffer)
        }
        window.Output.buffer = [];
    }
}
window.Text = {
    parse_patterns: parseAnsiPatterns
}