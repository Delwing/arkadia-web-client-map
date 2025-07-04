import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";
import {color, findClosestColor} from "@client/src/Colors.ts";

const table = color(findClosestColor("#949494")) + " Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:\n" +
    " o============================================================================o\n" +
    " |                Adresat badz                     Cena          Czas na      |\n" +
    " |               urzad pocztowy                  zl/sr/md      dostarczenie   |\n" +
    " o -------------------------------------------------------------------------- o\n" +
    " |   1. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
    " |   2. Luleck                                    0/ 4/ 2        nieogr.      |\n" +
    " |   3. Don Michael Tommasino, Campogrotta        2/19/ 6        nieogr.      |\n" +
    " |   4. Poczta miasta Campogrotta                 4/ 1/ 3        8 godzin     |\n" +
    " |   5. Vieri Sarietti, Ebino                     6/ 5/ 2        nieogr.      |\n" +
    " | * 6. Gustaw Kahner, Tadrig                     8/ 7/ 8        nieogr.      |\n" +
    " o -------------------------------------------------------------------------- o\n" +
    " |      Symbolem * oznaczono przesylki ciezkie.                               |\n" +
    " o============================================================================o"

export default new ClientScript(fakeClient)
    .reset()
    .setMapPosition(5469)
    .fake(table)
    .wait(500)
    .send("wybierz paczke 3")
    .wait(500)
    .fake("Pracownik poczty przekazuje ci jakas paczke.")
    .wait(100)
    .send("sw")
    .wait(100)
    .send("e")
    .wait(100)
    .send("e")
    .wait(100)
    .send("e")
    .wait(100)
    .event("gmcp.objects.data", {})
    .wait(100)
    .send("oddaj paczke")
    .fake("Oddajesz pocztowa paczke.")
    .wait(100)
    .setMapPosition(5469)

