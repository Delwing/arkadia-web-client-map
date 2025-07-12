import Client from "../Client";
import { colorStringInLine, findClosestColor } from "../Colors";
import loadMagicKeys from "./magicKeyLoader";

export default async function initMagicKeys(client: Client) {
    const tag = "magicKeys";
    try {
        const keys = await loadMagicKeys();
        const colorCode = findClosestColor("#00ff7f");
        keys.forEach((pattern: string) => {
            client.Triggers.registerTrigger(pattern, (raw) => {
                return colorStringInLine(raw, pattern, colorCode);
            }, tag);
        });
    } catch (e) {
        console.error("Failed to load magic keys", e);
    }
}
