import {useState} from "react";

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

function TriggerNode({trigger, line, type, parentMatched}: {trigger: any; line: string; type: string; parentMatched: boolean}) {
    const matched = parentMatched && !!matches(trigger, line, type);
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
            <span style={{color: matched ? "lightgreen" : "red"}}>{patternStr}</span>
            {trigger.children.size > 0 && (
                <ul style={{paddingLeft: "1rem"}}>
                    {Array.from(trigger.children.values()).map((child: any) => (
                        <TriggerNode key={child.id} trigger={child} line={line} type={type} parentMatched={matched} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function TriggerTester() {
    const [line, setLine] = useState("");
    const triggers = Array.from(window.clientExtension.Triggers.triggers.values());
    return (
        <div className="mt-3">
            <input className="form-control mb-2" placeholder="Test line" value={line} onChange={e => setLine(e.currentTarget.value)} />
            <ul style={{listStyleType: "none", paddingLeft: 0}}>
                {triggers.map(trigger => (
                    <TriggerNode key={trigger.id} trigger={trigger} line={line} type="" parentMatched={true} />
                ))}
            </ul>
        </div>
    );
}
