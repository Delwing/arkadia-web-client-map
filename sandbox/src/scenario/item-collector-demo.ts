import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": { desc: "Eamon", living: true, team: true, team_leader: true },
        "2": { desc: "Beata", living: true, team: true },
    })
    .fake("Zabiles poteznego trolla.")
    .call(() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, code: 'Digit3' })))
    .fake("Beata zabila kamiennego golema.")
    .call(() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, code: 'Digit3' })));
