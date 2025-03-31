import ClientExtension from "./ClientExtension";
import People from "./People";

chrome.runtime.sendMessage('ndmaahkebmmmjcebidefopgocgbbkikh', 'ready');

const originalRefreshPosition = Maps.refresh_position
const originalSetPosition = Maps.set_position
const originalUnsetPosition = Maps.unset_position
const gmcpParseOption = Gmcp.parse_option_subnegotiation


let clientExtension = new ClientExtension()

Gmcp.parse_option_subnegotiation = (match) => {
    const prefix = match.substring(0, 2)
    const postfix = match.substring(match.length - 2)
    const message = match.substring(2, match.length - 2)
    if (message.substring(0, 1) === 'É') {
        const [type, data] = [message.substring(1, message.indexOf(" ")), message.substring(message.indexOf(" "))]
        const parsed = JSON.parse(data)
        clientExtension.sendEvent(`gmcp.${type}`, parsed)
        if (type === "gmcp_msgs") {
            let data = atob(parsed.text)
            data = clientExtension.onLine(data)
            parsed.text = btoa(data)
            match = `${prefix}É${type} ${JSON.stringify(parsed)}${postfix}`
            clientExtension.sendEvent(`gmcp_msg.${parsed.type}`)
        }
    }
    return gmcpParseOption(match)
}


const aliases = [
    {
        pattern: /\/fake (.*)/, callback: (matches) => {
            return Output.send(Text.parse_patterns(clientExtension.onLine(matches[1])));
        }
    },
    {
        pattern: /\/cofnij$/, callback: () => {
            return clientExtension.sendEvent('moveBack');
        }
    },
    {
        pattern: /\/move (.*)$/, callback: (matches) => {
            return clientExtension.sendEvent('move', matches[1]);
        }
    },
    {
        pattern: /\/ustaw (.*)$/, callback: (matches) => {
            return clientExtension.sendEvent('setPosition', matches[1]);
        }
    },
    {
        pattern: /\/prowadz (.*)$/, callback: (matches) => {
            return clientExtension.sendEvent('leadTo', matches[1]);
        }
    },
    {
        pattern: /\/prowadz-$/, callback: (matches) => {
            return clientExtension.sendEvent('leadTo');
        }
    }
]

window.addEventListener('ready', () => {
    Input.send = (command) => {
        const isAlias = aliases.find(alias => {
            const matches = command.match(alias.pattern)
            if (matches) {
                alias.callback(matches);
                return true;
            }
            return false
        })
        if (!isAlias && command !== undefined) {
            command.split("#").forEach(subcommand => {
                clientExtension.sendEvent('command', command)
            })
        }
    }
    Maps.refresh_position = () => {
        originalRefreshPosition()
        clientExtension.sendEvent('refreshMapPosition')
    };
    Maps.set_position = (e) => {
        originalSetPosition(e)
        clientExtension.sendEvent('mapPosition', Maps.data)
    };
    Maps.unset_position = (e) => {
        originalUnsetPosition(e)
        clientExtension.sendEvent('mapPosition', {})
    };
})

/*
    Blockers
 */
import blockers from './blockers.json'

blockers.forEach(blocker => {
    let blockerPattern = blocker.type === "0" ? blocker.pattern : new RegExp(blocker.pattern)
    clientExtension.registerTrigger(blockerPattern, () => {
        return clientExtension.sendEvent('moveBack');
    })
})

/*
    People
 */
const people = new People(clientExtension)

/*
    Follows
 */

const follows = [
    /^.*[pP]odazasz (|skradajac sie )za (.* na (.*?))(?:,.*)?\.$/,
    /^Wraz z ([a-zA-Z ,]*) podazasz za (.* na (.*?))(?:,.*)?\.$/
]

follows.forEach(follow => {
    clientExtension.registerTrigger(follow, (rawLine, line) => {
        const matches = line.match(follow)
        clientExtension.sendEvent('move', matches[3])
    })
})

clientExtension.registerTrigger('Wykonuje komende \'idz ', () => {
    clientExtension.sendEvent('refreshPositionWhenAble')
})


clientExtension.registerTrigger('testing', (line, rawLine, matches, script) => {
    script.fg()
})

window.clientExtension = clientExtension

