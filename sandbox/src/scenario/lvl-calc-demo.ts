import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";
import {color, findClosestColor} from "@client/src/Colors.ts";

export default new ClientScript(fakeClient)
    .reset()
    .send("cechy")
    .fake(color(findClosestColor("#949494")) + "Jestes potezny i duzo ci brakuje, zebys mogl wyzej ocenic swa sile.")
    .fake(color(findClosestColor("#949494")) + "Jestes zreczny i bardzo duzo ci brakuje, zebys mogl wyzej ocenic swa zrecznosc.")
    .fake(color(findClosestColor("#949494")) + "Jestes muskularny i troche ci brakuje, zebys mogl wyzej ocenic swa wytrzymalosc.")
    .fake(color(findClosestColor("#949494")) + "Jestes inteligentny i duzo ci brakuje, zebys mogl wyzej ocenic swoj intelekt.")
    .fake(color(findClosestColor("#949494")) + "Jestes odwazny i bardzo niewiele ci brakuje, zebys mogl wyzej ocenic swa odwage.")
    .fake(color(findClosestColor("#949494")) + "Obecnie do waznych cech zaliczasz sile oraz wytrzymalosc, do srednio waznych zrecznosc, a do nieistotnych intelekt oraz odwage.");

