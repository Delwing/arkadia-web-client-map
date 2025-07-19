import Client from "../Client";

interface Entry {
    pattern: RegExp | string;
    command: string | ((m: RegExpMatchArray) => string);
}

export default function initFollowSpecialExits(client: Client) {
    const tag = "follow-special-exits";

    const entries: Entry[] = [
        { pattern: /dotyka swietlistego slupa energii\./, command: "dotknij slupa;e;e;wespnij sie po linie" },
        { pattern: /wyciagna swa reke i dotyka statui\. O dziwo kamien nie stawia zadnego oporu\./, command: "dotknij statui" },
        { pattern: /otwiera klape i wydostaje sie przez otwor w suficie na gore\./, command: "otworz klape" },
        { pattern: /uklada sie w sarkofagu\. Po chwili wieko zasuwa sie\./, command: "otworz sarkofag;wejdz do sarkofagu" },
        { pattern: /napina sie i probuje podwazyc jeden z glazow, ktory po chwili ustepuje ujawniajac spora/, command: "podwaz czarny glaz" },
        { pattern: /wskazuje na czarny glaz\./, command: "podwaz czarny glaz" },
        { pattern: /nagle wraca na swoja pierwotna pozycje\./, command: "podwaz czarny glaz" },
        { pattern: /przechodzi na (\w+) po desce nad metna woda\./, command: m => m[1] },
        { pattern: /przeciska sie do baszty\./, command: "przecisnij sie do baszty" },
        { pattern: /uwaznie stawiajac kazdy swoj krok przeciska sie pomiedzy skalami\./, command: "przecisnij sie miedzy skalami" },
        { pattern: /przeciska sie na polnoc\./, command: "przecisnij sie na polnoc" },
        { pattern: /przeciska sie na poludnie\./, command: "przecisnij sie na poludnie" },
        { pattern: /przeciska sie obok drzewa\./, command: "przecisnij sie obok drzewa" },
        { pattern: /wciska sie w przeswit pod pniem, po chwili/, command: "przecisnij sie pod pniem" },
        { pattern: /znika w gaszczu krzakow\./, command: "przecisnij sie przez gaszcz" },
        { pattern: /przeciska sie przez krzaki\./, command: "przecisnij sie przez krzaki" },
        { pattern: /rozgarnia krzewy probujac sie przez nie przedrzec\. Po chwili znika wewnatrz sciany roslinnosci\./, command: "przecisnij sie przez krzaki" },
        { pattern: /znika w kepie wawrzynow\./, command: "przecisnij sie przez krzaki" },
        { pattern: /zaczyna przeciskac sie przez krzaki na/, command: "przecisnij sie przez krzaki" },
        { pattern: /znika w kepie krzakow\./, command: "przecisnij sie przez krzaki" },
        { pattern: /ostroznie przedziera sie przez sciane galezi rosnacych tu krzakow\./, command: "przecisnij sie przez krzaki" },
        { pattern: /wbiega w krzaki w pospiechu i ze wszystkich sil przedziera sie przez ich galezie\./, command: "przecisnij sie przez krzaki" },
        { pattern: /przeciska sie przez lukarne\./, command: "przecisnij sie przez lukarne" },
        { pattern: /pochyla sie i czolgajac probuje przecisnac sie przez otwor w murze\.\.\. po chwili znika ci z oczu\./, command: "przecisnij sie przez otwor" },
        { pattern: /przeciska sie przez otwor\./, command: "przecisnij sie przez otwor" },
        { pattern: /pochyla sie i probuje wpelznac do otworu\./, command: "przecisnij sie przez otwor" },
        { pattern: /odsuwa gelezie z ogromnego glazu i wchodzi przez znajdujacy sie u jego podstawy otwor pod ziemie\./, command: "przecisnij sie przez otwor" },
        { pattern: /znika w szczelinie\./, command: "przecisnij sie przez szczeline" },
        { pattern: /przeciska sie przez szczeline\./, command: "przecisnij sie przez szczeline" },
        { pattern: /wchodzi do szczeliny miedzy glazami i znika w jej mroku\./, command: "przecisnij sie przez szczeline" },
        { pattern: /podchodzi do szczeliny we wschodniej scianie i szamotajac sie przez moment znika  w jej wnetrzu\./, command: "przecisnij sie przez szczeline" },
        { pattern: /przeciska sie przez znajdujaca/, command: "przecisnij sie przez szczeline" },
        { pattern: /wchodzi do szczeliny by po chwili zniknac w jej wnetrzu\./, command: "przecisnij sie przez szczeline" },
        { pattern: /przywiera plasko do ziemi i wczolguje sie w szczeline\./, command: "przecisnij sie przez szczeline" },
        { pattern: /spuszczajac nogi w szczeline siada na ziemi, by po chwili zniknac w otworze\./, command: "przecisnij sie przez szczeline" },
        { pattern: /znika w kepie brzozek\./, command: "przecisnij sie przez szczeline" },
        { pattern: /wciska sie do szczeliny w scianie i po chwili znika z oczu\./, command: "przecisnij sie przez szczeline" },
        { pattern: /przeslizguje sie przez szczeline\./, command: "przecisnij sie przez szczeline" },
        { pattern: /wciska sie w skalne pekniecie w jednej ze scian\./, command: "przecisnij sie przez szczeline" },
        { pattern: /podchodzi pod bluszczowa zaslone\. Rozglada sie chwile, po czym rozwiera/, command: "przedrzyj sie przez bluszcz" },
        { pattern: /podaza na druga strone mostu, stapajac po (\w+) plytkach\./, command: m => `przejdz po ${m[1]} plytkach` },
        { pattern: /podaza na druga strone pieczary, stapajac po (\w+) plytkach\./, command: m => `przejdz po ${m[1]} plytkach` },
        { pattern: /podaza przez furtke\./, command: "przejdz przez furtke" },
        { pattern: /znika ci nagle z oczu\./, command: "przejdz przez portal" },
        { pattern: /podaza na druga strone krypty przez (.+)\./, command: m => `przejdz przez ${m[1]}` },
        { pattern: /na drugi brzeg koryta\./, command: "przejdz przez strumien" },
        { pattern: /przechodzi przez iluzje sciany\./, command: "przejdz przez wneke" },
        { pattern: /przechodzi przez wneke\./, command: "przejdz przez wneke" },
        { pattern: /podaza w kierunku wodospadu\./, command: "wejdz do wody;przejdz przez wodospad" },
        { pattern: /podaza przez lustro wodospadu na zewnatrz\./, command: "przejdz przez wodospad" },
        { pattern: /nabiera powietrza, zamyka oczy i nagle znika!/, command: "przejdz przez zachodnia sciane" },
        { pattern: /rusza w kierunku przegradzajacych droge glazow/, command: "przecisnij sie za glazy" },
        { pattern: /przesuwa lekko rzezbiony kredens, znikajac w czarnej otchlani jaka sie za nim odslania\./, command: "przekrec galke;odsun kredens" },
        { pattern: /nurkuje i przeplywa na polnoc\./, command: "przeplyn na polnoc" },
        { pattern: /nurkuje i przeplywa na poludnie\./, command: "przeplyn na poludnie" },
        { pattern: /wchodzi do wody i przeplywa na przeciwlegly brzeg\./, command: "przeplyn rzeke" },
        { pattern: /spycha jedno z czolen na wode/, command: "przepraw sie przez rzeke" },
        { pattern: /wchodzi do niezbyt glebokiej wody po piers i przeprawia sie na przeciwlegly brzeg\./, command: "przepraw sie przez rzeke" },
        { pattern: /wchodzi na lod skuwajacy rzeke i ostroznie stawiajac kroki przeprawia sie na przeciwlegly brzeg\./, command: "przepraw sie przez rzeke" },
        { pattern: /bierze rozbieg i przeskakuje na most\./, command: "przeskocz na most" },
        { pattern: /bierze rozbieg i przeskakuje na polke\./, command: "przeskocz na polke" },
        { pattern: /bierze rozped i z latwoscia przeskakuje nad zaglebieniem, podazajac na polnoc\./, command: "przeskocz na polnoc" },
        { pattern: /bierze rozped i z latwoscia przeskakuje nad zaglebieniem, podazajac na poludnie\./, command: "przeskocz na poludnie" },
        { pattern: /bierze rozbieg i przeskakuje przepasc\./, command: "przeskocz przepasc" },
        { pattern: /bierze rozbieg i przeskakuje szczeline\./, command: "przeskocz szczeline" },
        { pattern: /bierze rozbieg i przeskakuje wyrwe\./, command: "przeskocz wyrwe" },
        { pattern: /bierze rozbieg by przeskoczyc wyrwe\./, command: "przeskocz wyrwe" },
        { pattern: /zapiera sie nogami o grunt i probuje przesunac glaz\./, command: "przesun glaz" },
        { pattern: /przesuwa plyte i wydostaje sie przez otwor w suficie na gore\./, command: "przesun plyte" },
        { pattern: /zatyka nos i skacze do stawu machajac nogami\./, command: "skocz do stawu" },
        { pattern: /unosi ciezka, zardzewiala krate i zeskakuje do otworu, ktory zaslaniala\./, command: "unies krate" },
        { pattern: /zapiera sie nogami o grunt i probuje uniesc ((?:[\w-]+ )?[\w-]+ \w+)\./, command: m => `unies ${m[1]}` },
        { pattern: /zapiera sie nogami o grunt i probuje uniesc ((?:[\w-]+ )?[\w-]+ \w+) w podlodze\./, command: m => `unies ${m[1]}` },
        { pattern: /znika nagle\./, command: "wcisnij plaskorzezbe" },
        { pattern: /pochyla sie i niemal na czworaka wciska sie do wneki pod rumowiskiem, aby po chwili zupelnie w niej zniknac\./, command: "wcisnij sie do wneki" },
        { pattern: /calkiem sprawnie radzac sobie ze wspinaczka po korzeniach, podaza w kierunku powierzchni ziemi\./, command: "wdrap sie na gore" },
        { pattern: /pokonujac zarastajace droge zarosla wchodzi do wnetrza spalonej chaty\./, command: "wejdz do chaty" },
        { pattern: /wchodzi do czerwonego wozu\./, command: "wejdz do czerwonego wozu" },
        { pattern: /przeciska sie przez otwor do ogromnej dziupli\./, command: "wejdz do dziupli" },
        { pattern: /podchodzi do waskiej dziury pod jednym drzew i po chwili w nim znika\./, command: "wejdz do dziury" },
        { pattern: / wsuwa sie do grobowca\./, command: "wejdz do grobowca" },
        { pattern: /podaza do mauzoleum\./, command: "wejdz do grobowca" },
        { pattern: /podaza do grobowca\./, command: "wejdz do grobowca" },
        { pattern: /na kleczkach wchodzi do jamy\./, command: "wejdz do jamy" },
        { pattern: /nagle znika ci z oczu!/, command: "wejdz do jamy" },
        { pattern: /wchodzi do jaskini\./, command: "wejdz do jaskini" },
        { pattern: /znika w glebinach komina, pomagajac sobie przy tym wolna reka\./, command: "opusc bronie;wejdz do komina;dobadz wszystkich broni" },
        { pattern: /mocno odbija sie stopami od podloza i zaczyna wspinaczke wglab tunelu\./, command: "opusc bronie;wejdz do komina;dobadz wszystkich broni" },
        { pattern: /podaza do krypty\./, command: "wejdz do krypty" },
        { pattern: /schyla sie niezgrabnie i wchodzi do krypty\./, command: "wejdz do krypty" },
        { pattern: /schodzi po zboczu\./, command: "zejdz po zboczu" },
        { pattern: /ostroznie schodzi po zboczu pod most\./, command: "zejdz pod most" },
        { pattern: /zaczyna schodzic pod most\./, command: "zejdz pod most" },
        { pattern: /zaczyna schodzic pod poklad\./, command: "zejdz pod poklad" },
        { pattern: /zaczyna schodzic z kutra\./, command: "zejdz z kutra" },
        { pattern: /zeskakuje na dol\./, command: "zeskocz na dol" },
        { pattern: /zeskakuje na skalna polke\./, command: "zeskocz na polke" },
    ];

    function containsLeader(line: string) {
        const leader = client.TeamManager.getLeader();
        return !!leader && line.toLowerCase().includes(leader.toLowerCase());
    }

    entries.forEach(({ pattern, command }) => {
        client.Triggers.registerTrigger(pattern, (_r, line, m) => {
            if (!containsLeader(line)) return undefined;
            const cmd = typeof command === "function" ? command(m) : command;
            client.FunctionalBind.set(cmd);
            return undefined;
        }, tag);
    });
}
