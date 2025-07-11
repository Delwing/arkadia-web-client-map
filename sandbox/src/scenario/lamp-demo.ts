import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Zapalasz srebrna lampe.")
    .fake("butelka oleju jest pusta.")
    .fake("Czym chcesz napelnic lampe");
