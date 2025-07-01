import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

const lines = [
    "Wojownik atakuje cie!",
    "W oczach Eamon rozpala sie swiety ogien nienawisci i z imieniem Morra na ustach rzuca sie do walki z toba!",
    "Ku twojemu zdumieniu, potwor pojawil sie nagle tuz obok ciebie!"
];

function pick() {
    return lines[Math.floor(Math.random() * lines.length)];
}

export default new ClientScript(fakeClient)
    .reset()
    .call(() => fakeClient.fake(pick()));
