import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("settings", { enemyGuilds: ['Templariusze', 'Rycerze'] })
    .fake("[Mordimer] zaprasza cie do swojej druzyny.")
    .fake("[Vesper] zaprasza cie do swojej druzyny.")
    .fake("[UnknownPlayer] zaprasza cie do swojej druzyny.")
    .fake("Gandalf zaprasza cie do swojej druzyny.");
