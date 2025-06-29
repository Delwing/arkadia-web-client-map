import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .send("/pojemnik")
    .fake("Trzymasz ciezki bojowy topor w prawej rece.")
    .fake("Przy lewym boku masz przypiety kunsztowny skorzany temblak.")
    .fake("Na plecach nosisz zamkniety szary skorzany plecak.")
    .fake("Masz na sobie wzmocniony pelny pancerz kolczy, pare skorzanych wysokich butow i okragla drewniana tarcze.")
    .fake("Nosisz ciezki skorzany plaszcz.")
    .fake("Do pasa masz przytroczona zamknieta ciemnoniebieska runiczna sakiewke.")
    .fake("Masz przewieszony przez ramie brazowy krety rog - symbol rozpoznawczy pocztylionow.")
    .fake("Nosisz zamkniete male zawiniatko.")
    .fake("Masz przy sobie czarnookiego dumnego kruka, stara podniszczona fajke, maly cynowy kubek, zelazna lyzeczke, zelazny widelec i drewniana lyzke.");
