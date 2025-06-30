import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

const shipTriggers = [
  "Wszyscy na poklad!",
  "przybija wielki trojmasztowy galeon.",
  "Tratwa przybija do brzegu.",
  "Tratwa.",
  "Rzeczna tratwa.",
  "Doplynelismy. Mozna wysiadac",
  "Marynarze sprawnie cumuja",
  "Szeroki zielony prom",
  "Prom.",
  "Barka.",
  "Tajemniczy okret",
  "Smukly drakkar",
  "Szeroka knara",
  "Stary buzar",
  "Plaskodenny skeid"
];

function pick() {
  return shipTriggers[Math.floor(Math.random() * shipTriggers.length)];
}

const script = new ClientScript(fakeClient).reset();
for (let i = 0; i < 5; i++) {
  script.fake(pick());
}

export default script;
