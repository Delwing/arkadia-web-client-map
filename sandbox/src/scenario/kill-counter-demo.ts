import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../index.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Zabiles wielkiego dzikiego kamiennego trolla.")
    .fake("Zabiles poteznego wscieklego krasnoluda chaosu.")
    .fake("Zabiles malutkiego wscieklego snotlinga.")
    .fake("Zabiles brzydkiego zgarbionego goblina.")
    .fake("Zabiles dzikiego wscieklego trolla.")
    .fake("Zabiles ogromnego szybkiego kamiennego trolla.")
    .fake("Zabiles dzikiego roslego krasnoluda chaosu.")
    .fake("Zabiles malego przebieglego goblina.")
    .fake("Zabiles silnego roslego trolla.")
    .fake("Zabiles Ryszard.")
    .send("/zabici");

