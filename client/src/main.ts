import Client from "./Client";
import People from "./People";
import registerLuaGagTriggers from "./scripts/./luaGags";
import Port = chrome.runtime.Port;

const gmcpParseOption = Gmcp.parse_option_subnegotiation
export const rawOutputSend = Output.send
export const rawInputSend = Input.send

export const client = new Client()

Gmcp.parse_option_subnegotiation = (match) => {
    const prefix = match.substring(0, 2)
    const postfix = match.substring(match.length - 2)
    const message = match.substring(2, match.length - 2)
    if (message.substring(0, 1) === 'É') {
        const [type, data] = [message.substring(1, message.indexOf(" ")), message.substring(message.indexOf(" "))]
        const parsed = JSON.parse(data)
        client.sendEvent('gmcp', { path: type, value: parsed })
        client.sendEvent(`gmcp.${type}`, parsed)
        if (type === "gmcp_msgs") {
            let text = atob(parsed.text)
            text = client.onLine(text, parsed.type)
            parsed.text = btoa(text)
            match = `${prefix}É${type} ${JSON.stringify(parsed)}${postfix}`
            client.addEventListener('output-sent', () => client.sendEvent(`gmcp_msg.${parsed.type}`, parsed), {once: true})
        }
    }
    gmcpParseOption(match)
}
Input.send = (command?: string) => {
    const cmd = command ?? ""
    const isAlias = aliases.find(alias => {
        const matches = cmd.match(alias.pattern)
        if (matches) {
            Output.send("→ " + cmd, "command")
            alias.callback(matches);
            return true;
        }
        return false
    })
    if (!isAlias) {
        cmd.split("#").forEach(subcommand => {
            client.sendCommand(subcommand);
        })
    }
}

const aliases = [
    {
        pattern: /\/fake (.*)/, callback: (matches: RegExpMatchArray) => {
            // @ts-ignore
            return Output.send(Text.parse_patterns(client.onLine(matches[1])));
        }
    },
    {
        pattern: /\/cofnij$/, callback: () => {
            client.Map.moveBack();
        }
    },
    {
        pattern: /\/move (.*)$/, callback: (matches: RegExpMatchArray) => {
            client.Map.move(matches[1]);
        }
    },
    {
        pattern: /\/ustaw (.*)$/, callback: (matches: RegExpMatchArray) => {
            client.Map.setMapRoomById(parseInt(matches[1]));
        }
    },
    {
        pattern: /\/prowadz (.*)$/, callback: (matches: RegExpMatchArray) => {
            client.sendEvent('leadTo', matches[1]);
        }
    },
    {
        pattern: /\/prowadz-$/, callback: () => {
            client.sendEvent('leadTo');
        }
    },
    {
        pattern: /\/zlok$/, callback: () => {
            client.Map.refresh();
        }
    }
]

//TODO to be extracted
function backgroundConnector() {
    function connectToBackground(extensionId: string, initial: boolean = false) {
        const port: Port = chrome.runtime.connect(extensionId)
        client.connect(port, initial)
        port.onDisconnect.addListener(() => {
            connectToBackground(extensionId)
        })
    }

    window.addEventListener('extension-loaded', (event) => {
        connectToBackground((<CustomEvent>event).detail, true)
    })
}

backgroundConnector();

/*
    Blockers
 */
import blockers from './blockers.json'

blockers.forEach(blocker => {
    let blockerPattern = blocker.type === "0" ? blocker.pattern : new RegExp(blocker.pattern)
    client.Triggers.registerTrigger(blockerPattern, (): undefined => {
        client.Map.moveBack()
    }, "blocker")
})

/*
    People
 */
new People(client)
registerGagTriggers(client)
registerLuaGagTriggers(client)

/*
    Follows
 */

const follows = [
    /^.*[pP]odazasz (|skradajac sie )za (.* na (.*?))(?:,.*)?\.$/,
    /^Wraz z ([a-zA-Z ,]*) podazasz za (.* na (.*?))(?:,.*)?\.$/
]

follows.forEach(follow => {
    client.Triggers.registerTrigger(follow, (_rawLine, line): undefined => {
        const matches = line.match(follow)
        client.sendEvent('move', matches[3])
    }, "follow")
})

client.Triggers.registerTrigger('Wykonuje komende \'idz ', (): undefined => {
    client.sendEvent('refreshPositionWhenAble')
})


import initShips from "./scripts/ships"
import initBuses from "./scripts/buses"
import initGates from "./scripts/gates"
import initAttackBeep from "./scripts/attackBeep"

initShips(client)
initBuses(client)
initGates(client)
initAttackBeep(client)

import initKillTrigger from "./scripts/kill"
import initStun from "./scripts/stun"

initKillTrigger(client, aliases)
initStun(client)

import ItemCollector from "./scripts/itemCollector"

const itemCollector = new ItemCollector(client);
(client as any).ItemCollector = itemCollector;

aliases.push({
    pattern: /\/zbieraj_extra(.*)/,
    callback: (matches: RegExpMatchArray) => {
        const strTrim = (matches[1] || "").trim();
        itemCollector.addExtra(strTrim);
    },
});

aliases.push({
    pattern: /\/nie_zbieraj_extra(.*)/,
    callback: (matches: RegExpMatchArray) => {
        const strTrim = (matches[1] || "").trim();
        if (strTrim !== "") {
            itemCollector.removeExtra(strTrim, false);
        } else {
            itemCollector.removeExtra("", true);
        }
    },
});

import initContainers from "./scripts/prettyContainers"

initContainers(client)

import initBagManager from "./scripts/bagManager"
import initDeposits from "./scripts/deposits"

initBagManager(client, aliases)
initDeposits(client, aliases)

import initLvlCalc from "./scripts/lvlCalc"
import initItemCondition from "./scripts/itemCondition"
import initInvite from "./scripts/invite"
import initObjectAliases from "./scripts/objectAliases"
import registerGagTriggers from "./scripts/gags";

initLvlCalc(client, aliases)
initItemCondition(client)
initInvite(client)
initObjectAliases(client, aliases)

window["clientExtension"] = client
