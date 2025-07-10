import ClientScript from "../ClientScript.ts";
import {fakeClient} from "../fakeClient.ts";
import RandExp from "randexp";

async function loadPatterns(): Promise<string[]> {
    const res = await fetch("../client/src/scripts/gags.json");
    const data = await res.json();
    const patterns: string[] = [];
    const traverse = (node: any) => {
        if (!node) return;
        if (Array.isArray(node.patterns)) {
            for (const p of node.patterns) {
                if (typeof p.pattern === "string" && !p.pattern.startsWith("return")) {
                    patterns.push(p.pattern);
                }
            }
        }
        if (Array.isArray(node.triggers)) {
            for (const t of node.triggers) traverse(t);
        }
        if (Array.isArray(node.groups)) {
            for (const g of node.groups) traverse(g);
        }
    };
    for (const root of data) traverse(root);
    return Array.from(new Set(patterns));
}

export default new ClientScript(fakeClient)
    .reset()
    .call(async () => {
        const patterns = await loadPatterns();
        for (const pat of patterns) {
            let line: string;
            try {
                line = new RandExp(pat).gen();
            } catch {
                line = pat;
            }
            fakeClient.fake(line, "combat.avatar");
        }
    });
