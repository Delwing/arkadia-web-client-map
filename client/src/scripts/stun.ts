import Client from "../Client";

export default function initStun(client: Client) {
    const tag = "stun";

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

    startPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, () => {
            client.sendEvent("stunStart");
            return undefined;
        }, tag)
    );

    endPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, () => {
            client.sendEvent("stunEnd");
            return undefined;
        }, tag)
    );
}
