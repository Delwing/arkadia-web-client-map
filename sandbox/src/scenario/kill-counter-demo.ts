import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .event("gmcp.objects.data", {
        "1": {desc: "Eamon", living: true, team: true, team_leader: true},
        "2": {desc: "Beata", living: true, team: true},
    })
    .fake("Zabiles poteznego smoka chaosu.")
    .fake("Zabiles malego smoka chaosu.")
    .fake("Zabiles silnego kamiennego trolla.")
    .fake("Zabiles poteznego kamiennego trolla.")
    .fake("Zabiles wscieklego krasnoluda chaosu.")
    .fake("Zabiles Ryszarda.")
    .fake("Eamon zabil smoka chaosu.")
    .fake("Beata zabila smoka chaosu.")
    .fake("Eamon zabil poteznego kamiennego trolla.")
    .fake("Beata zabila wscieklego krasnoluda chaosu.")
    .fake("Sindarion zabil barczystego jasnowlosego bykocentaura.")
    .send("/zabici")
    .send("/zabici2");

