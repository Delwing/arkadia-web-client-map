import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../index.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Karczma.", 'room.short')
    .fake("Sa tutaj dwa widoczne wyjscia: polnoc i poludniowy-zachod..", 'room.exits');
