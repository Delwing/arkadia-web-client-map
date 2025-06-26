import "./sandbox.ts"
import "@client/src/main.ts"

import npc from "./npc.json";
import mapData from "../../data/mapExport.json"
import colors from "../../data/colors.json"
import {client} from "@client/src/main.ts";
import {FakeClient} from "./types/globals";

let fakeClient = client as FakeClient

fakeClient.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}));
const frame: HTMLIFrameElement = document.getElementById("cm-frame")! as HTMLIFrameElement;
frame.contentWindow?.postMessage({mapData, colors}, '*')

window.dispatchEvent(new CustomEvent("ready"));
fakeClient.eventTarget.dispatchEvent(new CustomEvent("settings", {
    detail: {
        guilds: [],
        packageHelper: true,
        inlineCompassRose: true
    }
}))


window.dispatchEvent(new CustomEvent("map-ready", {
    detail: {
        mapData, colors
    }
}));

fakeClient.eventTarget.dispatchEvent(new CustomEvent("gmcp.room.info", {
    detail: {map: {x: 80, y: 89, z: 0, name: "Wissenland"}}
}));

fakeClient.fake = (text: string, type?: string) => {
    client.sendEvent("gmcp_msg." + type, {})
    window.Output.send(window.Text.parse_patterns(client.onLine(text, type)), type)
}

// const table = " Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:\n" +
//     " o============================================================================o\n" +
//     " |                Adresat badz                     Cena          Czas na      |\n" +
//     " |               urzad pocztowy                  zl/sr/md      dostarczenie   |\n" +
//     " o -------------------------------------------------------------------------- o\n" +
//     " |   1. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
//     " |   2. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
//     " |   3. Don Michael Tommasino, Campogrotta        2/19/ 6        nieogr.      |\n" +
//     " |   4. Poczta miasta Campogrotta                 4/ 1/ 3        8 godzin     |\n" +
//     " |   5. Vieri Sarietti, Ebino                     6/ 5/ 2        nieogr.      |\n" +
//     " | * 6. Gustaw Kahner, Tadrig                     8/ 7/ 8        nieogr.      |\n" +
//     " o -------------------------------------------------------------------------- o\n" +
//     " |      Symbolem * oznaczono przesylki ciezkie.                               |\n" +
//     " o============================================================================o"
//
// client.fake(table)
// window.Input.send("wybierz paczke 3")
// client.fake("Pracownik poczty przekazuje ci jakas paczke.")
//
//
// client.fake(" ")
// client.fake("Ciosem ciezkiego bojowego topora w korpus zadajesz umiesnionemu zgarbionemu goblinowi nieduza rane i uderzeniem okraglej drewnianej tarczy odpychasz w tyl.", "combat.avatar")
// client.fake(" ")
// client.fake("Dlugoreki oglupialy ghoul probuje cie trafic pozolklymi paznokciami, lecz tobie udaje sie uniknac tego ciosu.", "combat.avatar")
// client.fake(" ")
//
// client.fake("Zatrzymujesz atak brzydkiego zgarbionego goblina pewnym blokiem okraglej drewnianej tarczy i poteznym ciosem ciezkiego bojowego topora powaznie ranisz mu korpus.", "combat.avatar");
// client.fake("Brzydki zgarbiony goblin wykonuje zamaszyste ciecie krzywym krotkim nozem mierzac w ciebie, lecz udaje ci sie oslonic okragla drewniana tarcza.", "combat.avatar");
// client.fake("Ranisz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w glowe.", "combat.avatar");
// client.fake("Brzydki zgarbiony goblin probuje cie trafic krzywym krotkim nozem, lecz tobie udaje sie uniknac tego ciosu.", "combat.avatar");
// client.fake("Ranisz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w nogi.", "combat.avatar");
fakeClient.fake("Brzydki zgarbiony goblin wykonuje zamaszyste ciecie krzywym krotkim nozem mierzac w ciebie, lecz udaje ci sie oslonic okragla drewniana tarcza.", "combat.avatar");
fakeClient.fake("Nurkujac pod atakiem brzydkiego zgarbionego goblina mocno ranisz go ciosem okraglej drewnianej tarczy i zaraz po tym kaleczysz uderzeniem ciezkiego bojowego topora w glowe.", "combat.avatar");
fakeClient.fake("W slepiach brzydkiego zgarbionego goblina pojawia sie nienawistny blysk, gdy zdecydowanym uderzeniem krzywego krotkiego noza przecina powietrze tuz przed twoja glowa.", "combat.avatar");
fakeClient.fake("Ranisz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w glowe.", "combat.avatar");
fakeClient.fake("W slepiach brzydkiego zgarbionego goblina pojawia sie nienawistny blysk, gdy zdecydowanym uderzeniem krzywego krotkiego noza przecina powietrze tuz przed twoja glowa.", "combat.avatar");
fakeClient.fake("Ranisz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w nogi.", "combat.avatar");
fakeClient.fake("Brzydki zgarbiony goblin trafia cie krzywym krotkim nozem w korpus, lecz caly impet uderzenia zostaje wyparowany przez wzmocniony pelny pancerz kolczy.", "combat.avatar");
fakeClient.fake("Kilkakrotnie tluczesz w korpus brzydkiego zgarbionego goblina poteznymi ciosami okraglej drewnianej tarczy i krwawo ranisz go ciezkim bojowym toporem.", "combat.avatar");
fakeClient.fake("Brzydki zgarbiony goblin probuje cie trafic krzywym krotkim nozem, lecz tobie udaje sie uniknac tego ciosu.", "combat.avatar");
fakeClient.fake("Wykonujesz zamaszyste ciecie ciezkim bojowym toporem mierzac w brzydkiego zgarbionego goblina, lecz ten oslania sie okragla drewniana tarcza.", "combat.avatar");
fakeClient.fake("Powaznie ranisz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w glowe.", "combat.avatar");
fakeClient.fake("Brzydki zgarbiony goblin wykonuje zamaszyste ciecie krzywym krotkim nozem mierzac w ciebie, lecz udaje ci sie oslonic okragla drewniana tarcza.", "combat.avatar");
fakeClient.fake("Masakrujesz brzydkiego zgarbionego goblina ciezkim bojowym toporem, trafiajac go w nogi.", "combat.avatar");
fakeClient.fake("Brzydki zgarbiony goblin umarl.", "combat.avatar");
fakeClient.fake("Zabiles zgarbionego brzydkiego goblina.");
fakeClient.fake("Wyszczerzony zielony goblin ledwo muska cie krzywym krotkim nozem, trafiajac cie w korpus.", "combat.avatar");

fakeClient.fake("Karczma.", 'room.short')
fakeClient.fake("Sa tutaj dwa widoczne wyjscia: polnoc i poludniowy-zachod..", 'room.exits')
