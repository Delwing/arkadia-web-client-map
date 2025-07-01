import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": { desc: "Eamon", living: true, team: true, team_leader: true },
    })
    .fake("Zabiles poteznego smoka chaosu.")
    .call(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Digit3", ctrlKey: true })))
    .fake("Eamon zabil wscieklego goblina.")
    .call(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Digit3", ctrlKey: true })));
