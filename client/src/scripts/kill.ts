import Client from "../Client";
import {encloseColor, findClosestColor} from "../Colors";

export default function init(client: Client) {
    client.Triggers.registerTrigger(/(^[ >]*(Zabil(?:es|as|)) (?<target>[a-zA-Z (),!]+)\.$)/, (rawLine): string => {
        return "  \n" + client.prefix(rawLine, encloseColor("[  ZABILES  ] ", findClosestColor("#ff6347"))) + "\n  "
    })
}