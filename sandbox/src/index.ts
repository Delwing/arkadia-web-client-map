import "./sandbox.ts"
import "@client/src/main.ts"

import npc from "./npc.json";
import mapData from "../../data/mapExport.json"
import colors from "../../data/colors.json"
import {color} from "@client/src/Colors.ts";

window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}));
const frame: HTMLIFrameElement = document.getElementById("cm-frame")! as HTMLIFrameElement;
frame.contentWindow?.postMessage({mapData, colors}, '*')

window.dispatchEvent(new CustomEvent("ready"));
window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("settings", {
    detail: {
        guilds: ["NPC", "MC"],
        packageHelper: true
    }
}))


window.dispatchEvent(new CustomEvent("map-ready", {
    detail: {
        mapData, colors
    }
}));

window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("gmcp.room.info", {
    detail: {map: {x: 80, y: 89, z: 0, name: "Wissenland"}}
}));

window.clientExtension.fake = (text: string, type?: string) => {
    window.Output.send(window.Text.parse_patterns(window.clientExtension.onLine(text, type)), type)
}

const table = " Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:\n" +
    " o============================================================================o\n" +
    " |                Adresat badz                     Cena          Czas na      |\n" +
    " |               urzad pocztowy                  zl/sr/md      dostarczenie   |\n" +
    " o -------------------------------------------------------------------------- o\n" +
    " |   1. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
    " |   2. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
    " |   3. Don Michael Tommasino, Campogrotta        2/19/ 6        nieogr.      |\n" +
    " |   4. Poczta miasta Campogrotta                 4/ 1/ 3        8 godzin     |\n" +
    " |   5. Vieri Sarietti, Ebino                     6/ 5/ 2        nieogr.      |\n" +
    " | * 6. Gustaw Kahner, Tadrig                     8/ 7/ 8        nieogr.      |\n" +
    " o -------------------------------------------------------------------------- o\n" +
    " |      Symbolem * oznaczono przesylki ciezkie.                               |\n" +
    " o============================================================================o"

window.clientExtension.fake(table)
window.Input.send("wybierz paczke 3")
window.clientExtension.fake("Pracownik poczty przekazuje ci jakas paczke.")


window.clientExtension.Triggers.registerTrigger((rawLine, line, _matches, type) => {
    return type == "combat.avatar" ? {index: 0} : undefined
}, (rawLine, line, matches, type) => {
    return color(25) + rawLine
})
window.clientExtension.fake("Ledwo muskasz brudnego brzydkiego goblina ciezkim bojowym toporem, trafiajac go w lewe ramie.", "combat.avatar")