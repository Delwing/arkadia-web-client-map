import {useState} from "react";

const typeOptions = [
    "combat.avatar",
    "combat.team",
    "combat.others",
    "emotes",
    "comm",
    "room.combat",
    "room.long",
    "room.short",
    "room.item",
    "room.exits",
    "room.contents.living",
    "room.contents.object",
    "room.contents",
    "living.long",
    "object.long",
    "system",
    "system.login",
    "mail",
    "editor.mail",
    "editor",
    "notification.mail",
    "notification.common",
    "notification.knowledge",
    "notification.relations",
    "notification.boards",
    "notification",
    "prompt",
    "other"
];

const stripAnsiCodes = (str: string) =>
    str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

function matches(trigger: any, rawLine: string, type = "") {
    const line = stripAnsiCodes(rawLine).replace(/\s$/g, "");
    let result;
    const pattern = trigger.pattern;
    try {
        if (pattern instanceof RegExp) {
            result = line.match(pattern);
        } else if (typeof pattern === "string") {
            const index = rawLine.toLowerCase().indexOf(pattern.toLowerCase());
            if (index > -1) {
                result = { index };
            }
        } else if (typeof pattern === "function") {
            result = pattern(rawLine, line, undefined, type);
        }
    } catch {
        result = undefined;
    }
    return result;
}

function hasMatch(trigger: any, line: string, type: string, parentMatched: boolean): boolean {
    const matched = parentMatched && !!matches(trigger, line, type);
    if (matched) return true;
    for (const child of trigger.children.values()) {
        if (hasMatch(child, line, type, matched)) return true;
    }
    return false;
}

function TriggerNode({trigger, line, type, parentMatched, showMatchedOnly}: {trigger: any; line: string; type: string; parentMatched: boolean; showMatchedOnly: boolean}) {
    const [expanded, setExpanded] = useState(false);
    const matched = parentMatched && !!matches(trigger, line, type);
    if (showMatchedOnly && !hasMatch(trigger, line, type, parentMatched)) {
        return null;
    }
    let patternStr: string;
    if (trigger.pattern instanceof RegExp) {
        patternStr = trigger.pattern.toString();
    } else if (typeof trigger.pattern === "string") {
        patternStr = trigger.pattern;
    } else {
        patternStr = "function";
    }
    return (
        <li>
            <div style={{display: 'flex', alignItems: 'center'}}>
                {trigger.children.size > 0 && (
                    <button className="btn btn-sm btn-link p-0 me-1" onClick={() => setExpanded(!expanded)}>
                        {expanded ? '▾' : '▸'}
                    </button>
                )}
                <span style={{color: matched ? "lightgreen" : "red"}}>{patternStr}</span>
            </div>
            {expanded && trigger.children.size > 0 && (
                <ul style={{paddingLeft: "1rem", listStyleType: "none"}}>
                    {Array.from(trigger.children.values()).map((child: any) => (
                        <TriggerNode key={child.id} trigger={child} line={line} type={type} parentMatched={matched} showMatchedOnly={showMatchedOnly} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function TriggerTester() {
    const [line, setLine] = useState("");
    const [type, setType] = useState("");
    const [showMatchedOnly, setShowMatchedOnly] = useState(false);
    const triggers = Array.from(window.clientExtension.Triggers.triggers.values());
    return (
        <div className="mt-3">
            <div className="d-flex gap-2 mb-2 align-items-center">
                <input className="form-control" placeholder="Test line" value={line} onChange={e => setLine(e.currentTarget.value)} />
                <select className="form-select w-auto" value={type} onChange={e => setType(e.currentTarget.value)}>
                    <option value="">(none)</option>
                    {typeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <label className="ms-2">
                    <input type="checkbox" className="form-check-input me-1" checked={showMatchedOnly} onChange={e => setShowMatchedOnly(e.currentTarget.checked)} />
                    Show matched only
                </label>
            </div>
            <ul style={{listStyleType: "none", paddingLeft: 0}}>
                {triggers.map(trigger => (
                    <TriggerNode key={trigger.id} trigger={trigger} line={line} type={type} parentMatched={true} showMatchedOnly={showMatchedOnly} />
                ))}
            </ul>
        </div>
    );
}
