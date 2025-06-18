import ClientExtension from "./ClientExtension";
import People from "./People";

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
            clientExtension.sendEvent(`gmcp_msg.${parsed.type}`, parsed)
        }
    }
    return gmcpParseOption(match)
}


const aliases = [
    {
        pattern: /\/fake (.*)/, callback: (matches) => {
            // @ts-ignore
            return Output.send(Text.parse_patterns(clientExtension.onLine(matches[1])));
        }
    },
    {
        pattern: /\/cofnij$/, callback: () => {
            clientExtension.mapHelper.moveBack();
        }
    },
    {
        pattern: /\/move (.*)$/, callback: (matches) => {
            clientExtension.mapHelper.move(matches[1]);
        }
    },
    {
        pattern: /\/ustaw (.*)$/, callback: (matches) => {
            clientExtension.mapHelper.setMapRoomById(matches[1]);
        }
    },
    {
        pattern: /\/prowadz (.*)$/, callback: (matches) => {
            clientExtension.sendEvent('leadTo', matches[1]);
        }
    },
    {
        pattern: /\/prowadz-$/, callback: () => {
            clientExtension.sendEvent('leadTo');
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
                clientExtension.sendCommand(subcommand);
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
    Maps.unset_position = () => {
        originalUnsetPosition()
        clientExtension.sendEvent('mapPosition', {})
    };
})

window.addEventListener('map-loaded', event => {
    const port = chrome.runtime.connect((<CustomEvent>event).detail)
    clientExtension.connect(port)
})

/*
    Blockers
 */
import blockers from './blockers.json'

blockers.forEach(blocker => {
    let blockerPattern = blocker.type === "0" ? blocker.pattern : new RegExp(blocker.pattern)
    clientExtension.Triggers.registerTrigger(blockerPattern, (): undefined => {
        clientExtension.sendEvent('moveBack');
    }, "blocker")
})

/*
    People
 */
new People(clientExtension)

/*
    Follows
 */

const follows = [
    /^.*[pP]odazasz (|skradajac sie )za (.* na (.*?))(?:,.*)?\.$/,
    /^Wraz z ([a-zA-Z ,]*) podazasz za (.* na (.*?))(?:,.*)?\.$/
]

follows.forEach(follow => {
    clientExtension.Triggers.registerTrigger(follow, (_rawLine, line): undefined => {
        const matches = line.match(follow)
        clientExtension.sendEvent('move', matches[3])
    }, "follow")
})

clientExtension.Triggers.registerTrigger('Wykonuje komende \'idz ', (): undefined => {
    clientExtension.sendEvent('refreshPositionWhenAble')
})

clientExtension.Triggers.registerTrigger(/^(?!Ktos|Jakis|Jakas).*(Doplynelismy.*(Mozna|w calej swej)|Marynarze sprawnie cumuja)/, (): undefined => {
    clientExtension.playSound("beep")
    clientExtension.setFunctionalBind("zejdz ze statku", () => {
        Input.send("zejdz ze statku")
        clientExtension.sendEvent('refreshPositionWhenAble')
    })
})

window["clientExtension"] = clientExtension