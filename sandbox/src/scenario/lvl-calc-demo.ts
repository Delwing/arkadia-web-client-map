import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .send("cechy")
    .fake("Jestes potezny i duzo ci brakuje, zebys mogl wyzej ocenic swa sile.")
    .fake("Jestes zreczny i bardzo duzo ci brakuje, zebys mogl wyzej ocenic swa zrecznosc.")
    .fake("Jestes muskularny i troche ci brakuje, zebys mogl wyzej ocenic swa wytrzymalosc.")
    .fake("Jestes inteligentny i duzo ci brakuje, zebys mogl wyzej ocenic swoj intelekt.")
    .fake("Jestes odwazny i bardzo niewiele ci brakuje, zebys mogl wyzej ocenic swa odwage.")
    .fake("Obecnie do waznych cech zaliczasz sile oraz wytrzymalosc, do srednio waznych zrecznosc, a do nieistotnych intelekt oraz odwage.");

