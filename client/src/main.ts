import Client from "./Client";
import People from "./People";
import registerGagTriggers from "./scripts/gags";
import {setGmcp} from "./gmcp";
import Port = chrome.runtime.Port;

const originalRefreshPosition = Maps.refresh_position
const originalSetPosition = Maps.set_position
const originalUnsetPosition = Maps.unset_position
const gmcpParseOption = Gmcp.parse_option_subnegotiation
export const rawSend = Output.send


export const client = new Client()

let isInitialConnection = true

Gmcp.parse_option_subnegotiation = (match) => {
    const prefix = match.substring(0, 2)
    const postfix = match.substring(match.length - 2)
    const message = match.substring(2, match.length - 2)
    if (message.substring(0, 1) === 'É') {
        const [type, data] = [message.substring(1, message.indexOf(" ")), message.substring(message.indexOf(" "))]
        const parsed = JSON.parse(data)
        setGmcp(type, parsed)
        client.sendEvent(`gmcp.${type}`, parsed)
        if (type === "gmcp_msgs") {
            let text = atob(parsed.text)
            text = client.onLine(text, parsed.type)
            parsed.text = btoa(text)
            match = `${prefix}É${type} ${JSON.stringify(parsed)}${postfix}`
            client.addEventListener('output-sent', () => client.sendEvent(`gmcp_msg.${parsed.type}`, parsed), {once: true})
        }
    }
    return gmcpParseOption(match)
}
Input.send = (command: string) => {
    const isAlias = aliases.find(alias => {
        const matches = command.match(alias.pattern)
        if (matches) {
            Output.send("→ " + command, "command")
            alias.callback(matches);
            return true;
        }
        return false
    })
    if (!isAlias && command !== undefined) {
        command.split("#").forEach(subcommand => {
            client.sendCommand(subcommand);
        })
    }
}
Maps.refresh_position = () => {
    originalRefreshPosition()
    client.sendEvent('refreshMapPosition')
};
Maps.set_position = (e) => {
    originalSetPosition(e)
    client.sendEvent('mapPosition', Maps.data)
};
Maps.unset_position = () => {
    originalUnsetPosition()
    client.sendEvent('mapPosition', {})
};

Output.send = (out, type): any => {
    const bufferSize = Output.buffer.length + 1
    const result = rawSend(out, type)
    client.sendEvent('output-sent', bufferSize)
    return result;
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
            Maps.refresh_position();
        }
    }
]

function connectToBackground(extensionId: string) {
    const port: Port = chrome.runtime.connect(extensionId)
    client.connect(port)
    if (isInitialConnection) {
        port.postMessage({type: 'GET_STORAGE', key: 'settings'})
        port.postMessage({type: 'GET_STORAGE', key: 'kill_counter'})
        port.postMessage({type: 'GET_STORAGE', key: 'containers'})
        isInitialConnection = false
    }
    port.onDisconnect.addListener(() => {
        connectToBackground(extensionId)
    })
}

window.addEventListener('extension-loaded', (event) => {
    connectToBackground((<CustomEvent>event).detail)
})

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
registerGagTriggers(client.Triggers)

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

initShips(client)

import initKillTrigger from "./scripts/kill"

initKillTrigger(client, aliases)

import initContainers from "./scripts/prettyContainers"

initContainers(client)

import initBagManager from "./scripts/bagManager"

initBagManager(client, aliases)

import initLvlCalc from "./scripts/lvlCalc"

initLvlCalc(client, aliases)

window["clientExtension"] = client
