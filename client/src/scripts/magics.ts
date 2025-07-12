import Client from "../Client";
import { colorStringInLine, findClosestColor } from "../Colors";
import loadMagics from "./magicsLoader";

export default async function initMagics(client: Client) {
    const tag = "magics";
    try {
        const magics = await loadMagics();
        const colorCode = findClosestColor('#B22222');
        magics.forEach((pattern: string) => {
            client.Triggers.registerTrigger(pattern, (raw) => {
                return colorStringInLine(raw, pattern, colorCode);
            }, tag);
        });
    } catch (e) {
        console.error("Failed to load magics", e);
    }
}
