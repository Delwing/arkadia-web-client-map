import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.room.info", {exits: ["polnoc", "poludniowy-zachod"]})
    .fake("Karczma.", 'room.short')
    .fake("Sa tutaj dwa widoczne wyjscia: polnoc i poludniowy-zachod.", 'room.exits');
