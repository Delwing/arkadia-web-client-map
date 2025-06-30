import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

const busTriggers = [
    "dylizans powoli zatrzymuje sie.",
    "i wsiada do powozu",
    "i wsiada do dylizansu",
    "Otwarty jadacy powoz powoli zatrzymuje sie.",
    "Drewniany stojacy woz",
    "Kupiecki stojacy woz z plandeka",
    "siada w malej bryczce.",
    "zsiada z malej bryczki.",
];

function pick() {
    return busTriggers[Math.floor(Math.random() * busTriggers.length)];
}

export default new ClientScript(fakeClient)
    .reset()
    .call(() => fakeClient.FunctionalBind.clear())
    .call(() => fakeClient.fake(pick()));
