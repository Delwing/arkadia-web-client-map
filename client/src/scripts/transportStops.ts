import Client from "../Client";

interface Stop {
    destination: number;
    stop_pattern: string;
}

interface Transport {
    stops: Stop[];
}

// Import ship definitions
import Ancelmus from './ships/Ancelmus.json';
import Annibale from './ships/Annibale.json';
import Asa from './ships/Asa.json';
import Batista from './ships/Batista.json';
import Bjorn from './ships/Bjorn.json';
import Cern from './ships/Cern.json';
import Charonda from './ships/Charonda.json';
import Creyard from './ships/Creyard.json';
import Daniel from './ships/Daniel.json';
import Elich from './ships/Elich.json';
import Flavius from './ships/Flavius.json';
import Francois from './ships/Francois.json';
import Gervais from './ships/Gervais.json';
import Gmeath from './ships/Gmeath.json';
import Gvidon from './ships/Gvidon.json';
import Hallgerda from './ships/Hallgerda.json';
import Haming from './ships/Haming.json';
import Jacob from './ships/Jacob.json';
import Kelim from './ships/Kelim.json';
import Louis from './ships/Louis.json';
import Luiggi from './ships/Luiggi.json';
import Malacius from './ships/Malacius.json';
import Mallcolm from './ships/Mallcolm.json';
import Olaf from './ships/Olaf.json';
import Pluskolec from './ships/Pluskolec.json';
import Rygwit from './ships/Rygwit.json';
import Strag from './ships/Strag.json';

import Jouinard from './other/Jouinard - Nuln.json';
import KrainaZgromadzenia from './other/Kraina Zgromadzenia - Nuln.json';
import MariborGrabowa from './other/Maribor - Grabowa Buchta.json';
import Salignac from './other/Salignac - Nuln.json';
import Varieno from './other/Varieno - Miragliano - Campogrotta.json';
import WyzimaOxenfurt from './other/Wyzima - Oxenfurt.json';

const transports: Transport[] = [
    Ancelmus,
    Annibale,
    Asa,
    Batista,
    Bjorn,
    Cern,
    Charonda,
    Creyard,
    Daniel,
    Elich,
    Flavius,
    Francois,
    Gervais,
    Gmeath,
    Gvidon,
    Hallgerda,
    Haming,
    Jacob,
    Kelim,
    Louis,
    Luiggi,
    Malacius,
    Mallcolm,
    Olaf,
    Pluskolec,
    Rygwit,
    Strag,
    Jouinard,
    KrainaZgromadzenia,
    MariborGrabowa,
    Salignac,
    Varieno,
    WyzimaOxenfurt,
];

export default function initTransportStops(client: Client) {
    transports.forEach(t => {
        t.stops.forEach(stop => {
            if (stop.stop_pattern) {
                const regex = new RegExp(stop.stop_pattern);
                client.Triggers.registerTrigger(regex, () => {
                    client.Map.setMapRoomById(stop.destination);
                    return undefined;
                }, 'transport-stop');
            }
        });
    });
}
