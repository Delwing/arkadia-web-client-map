import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../index.ts";

export default new ClientScript(fakeClient)
    .reset()
    // moje zabicia
    .fake("Zabiles poteznego smoka chaosu.")
    .fake("Zabiles malego smoka chaosu.")
    .fake("Zabiles silnego kamiennego trolla.")
    .fake("Zabiles poteznego kamiennego trolla.")
    .fake("Zabiles wscieklego krasnoluda chaosu.")
    .fake("Zabiles Helga.")
    // zabicia druzyny
    .fake("> Eamon zabil smoka chaosu.")
    .fake("> Beata zabila smoka chaosu.")
    .fake("> Eamon zabil poteznego kamiennego trolla.")
    .fake("> Beata zabila wscieklego krasnoluda chaosu.")
    .fake("> Sindarion zabil barczystego jasnowlosego bykocentaura.")
    .send("/zabici");

