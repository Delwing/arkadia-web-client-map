import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../index.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": { desc: "Vesper", living: true, team: true, team_leader: true },
        "2": { desc: "Pablo", living: true, team: true },
    })
    .debug("window.clientExtension.TeamManager.get_team_members()")
    .fake("Pablo porzuca twoja druzyne.")
    .debug("window.clientExtension.TeamManager.get_team_members()")
    .fake("Nie jestes w zadnej druzynie.")
    .debug("window.clientExtension.TeamManager.get_team_members()");

