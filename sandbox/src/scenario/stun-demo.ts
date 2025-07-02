import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Powoli osuwasz sie na ziemie")
    .fake("Powoli dochodzisz do siebie")
    .fake("golem w mgnieniu oka uderza w Bob, a on wyrwany z oslupienia, probuje ratowac sie krokiem w tyl. Jednak wiele to nie pomaga i sila uderzenia odrzuca");
