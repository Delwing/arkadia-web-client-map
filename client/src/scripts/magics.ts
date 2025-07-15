import Client from "../Client";
import { colorStringInLine, findClosestColor } from "../Colors";
import loadMagics from "./magicsLoader";

export const MAGICS_COLOR = findClosestColor('#B22222');
export default async function initMagics(client: Client) {
    const tag = "magics";
    try {
        const magics = await loadMagics();
        magics.forEach((pattern: string) => {
            client.Triggers.registerTokenTrigger(pattern, (raw) => {
                return colorStringInLine(raw, pattern, MAGICS_COLOR);
            }, tag);
        });
    } catch (e) {
        console.error("Failed to load magics", e);
    }
}
