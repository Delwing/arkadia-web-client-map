import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";

export default function initLeaderAttackWarning(client: Client) {
    const RED = findClosestColor("#ff0000");
    const PADDING = 4; // two spaces on each side

    function getLeaderTargetId(): string | undefined {
        const leader = client.TeamManager.getLeader();
        if (!leader) return undefined;
        const data = client.TeamManager.getAccumulatedObjectsData() as Record<string, any>;
        for (const obj of Object.values(data)) {
            if (obj && obj.desc === leader) {
                const target = (obj as any).attack_num;
                if (typeof target === 'number' || typeof target === 'string') {
                    return String(target);
                }
            }
        }
        return undefined;
    }

    function check() {
        const myTarget = client.TeamManager.getAttackTargetId();
        const leaderTarget = getLeaderTargetId();
        if (myTarget && leaderTarget && myTarget !== leaderTarget) {
            const text = "Atakujesz inny cel";
            const width = text.length + PADDING;
            const line = "=".repeat(width);
            const message = `${line}\n  ${text}  \n${line}`;
            client.println(colorString(message, RED));
        }
    }

    client.addEventListener('teamLeaderTargetNoAvatar', check);
}
