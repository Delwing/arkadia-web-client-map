import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": { desc: "Vesper", living: true, team: true, team_leader: true },
        "2": { desc: "Pablo", living: true, team: true },
    })
    .eval("window.clientExtension.TeamManager.getTeamMembers()")
    .fake("Pablo porzuca twoja druzyne.")
    .eval("window.clientExtension.TeamManager.getTeamMembers()")
    .fake("Nie jestes w zadnej druzynie.")
    .eval("window.clientExtension.TeamManager.getTeamMembers()");

