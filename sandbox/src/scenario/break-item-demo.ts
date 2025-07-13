import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Nagle topor rozpruwa sie.")
    .fake("Miecz bojowy peka!")
    .fake("Stalowa zbroja rozpada sie!");
