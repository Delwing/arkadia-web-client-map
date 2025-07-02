import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .call(() => {
        fakeClient.Map.currentRoom = { id: 1, name: 'Bank', userData: { bind: '/depozyt' } } as any;
    })
    .send('/depozyt')
    .fake('Twoj depozyt zawiera dwa miecze, tarcze.')
    .send('/depozyty');
