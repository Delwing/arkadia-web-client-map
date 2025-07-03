import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": { desc: "Gandalf", living: true, team: true, team_leader: false },
        "2": { desc: "Mordimer", living: true, team: false },
        "3": { desc: "Vesper", living: true, team: false },
        "4": { desc: "UnknownPlayer", living: true, team: false },
    })
    .event("settings", { enemyGuilds: ['Templariusze', 'Rycerze'] })
    .fake("[Mordimer] zaprasza cie do swojej druzyny.")
    .fake("[Vesper] zaprasza cie do swojej druzyny.")
    .fake("[UnknownPlayer] zaprasza cie do swojej druzyny.")
    .fake("Gandalf zaprasza cie do swojej druzyny.");
