import "./sandbox.js"
import "@components/dist/main.js"

import npc from "./npc.json";
window.dispatchEvent(new CustomEvent("npc", { detail: npc }));

window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("settings", {detail: {settings: {guilds: ["NPC", "MC"], packageHelper: true}}}))
window.clientExtension.fake = (text) => {
    Output.send(Text.parse_patterns(window.clientExtension.onLine(text)))
}

const fakeMe = " Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:\n" +
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

window.clientExtension.fake(fakeMe)