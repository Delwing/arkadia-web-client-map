import Client from "../Client";
import { encloseColor, findClosestColor } from "../Colors";

export default function initStun(client: Client) {
    const tag = "stun";
    const STUN_COLOR = findClosestColor("#ff0000");
    const NPC_COLOR = findClosestColor("#fffaf0");

    const stunPrefix = (raw: string) =>
        client.prefix(raw, encloseColor("[OGLUCH] ", STUN_COLOR)) +
        "\n\n[   OGLUCH   ] ----- JESTES OGLUSZONY -----\n\n";
    const endLine = "\n\n[   OGLUCH   ] ----- KONIEC OGLUCHA -----\n\n";
    const golemPrefix = (raw: string) =>
        client.prefix(raw, encloseColor("[OGLUCH] ", NPC_COLOR));

    const startPatterns = [
        /Powoli osuwasz sie na ziemie/,
        /Potem robi sie ciemno/,
        /Sila uderzania zamroczyla cie/,
        /tak silnym, ze swiat przed twoimi oczami niknie/,
        /Przymroczony tym uderzeniem czujesz jak nogi/,
        /wali cie na odlew .* chwiejesz/,
        /uderza cie w glowe i czujesz, ze tracisz przytomnosc/,
        /Uderzenie w glowe oglusza cie i powala na ziemie\./,
        /znienacka kopie cie w noge i kiedy tracisz rytm walki, przywala ci piescia prosto w nos\./,
        /Ktos bez zastanowienia uderza cie piescia w szczeke, robiac to z taka sila, ze niemal powala cie na ziemie\./,
        /silnym ciosem .* oglusza cie\b/,
        /Gigantyczny drapiezny troll pochyla leb i szarzuje, by uderzyc cie kreconymi rogami prosto w klatke piersiowa\. Potezny cios odrzuca cie i wyrywa oddech z piersi\./,
        /^(Saurgl|Posepny okrutny rycerz chaosu) pochyla glowe i z przerazliwa sila uderza dlugimi, ostro zakonczonymi rogami wyrastajacymi mu spod czarnego helmu\. Potezny cios odrzuca cie i wyrywa oddech z piersi\.$/,
        / poteznym ciosem ogona oglusza cie\./,
    ];

    const endPatterns = [
        /Powoli dochodzisz do siebie/,
        /Czujesz jak slabosc po zadanym ciosie w glowe mija/,
        /Udaje ci sie uwolnic z sieci/,
        /Powoli odzyskujesz swobode ruchow/,
    ];

    const golemPatterns = [
        /golem w mgnieniu oka uderza w [A-Za-z]+, a on.? wyrwan. z oslupienia, probuje ratowac sie krokiem w tyl\. Jednak wiele to nie pomaga i sila uderzenia odrzuca/,
        /^Niespodziewanie kamienny golem wyciaga reke i uderza w glowe .*$/,
    ];

    startPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, (raw) => {
            client.sendEvent("stunStart");
            return stunPrefix(raw);
        }, tag)
    );

    endPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, () => {
            client.sendEvent("stunEnd");
            return endLine;
        }, tag)
    );

    golemPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, raw => golemPrefix(raw), tag)
    );
}
