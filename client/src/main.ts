import Client from "./Client";
import People from "./People";

const originalRefreshPosition = Maps.refresh_position
const originalSetPosition = Maps.set_position
const originalUnsetPosition = Maps.unset_position
const gmcpParseOption = Gmcp.parse_option_subnegotiation


let client = new Client()

Gmcp.parse_option_subnegotiation = (match) => {
    const prefix = match.substring(0, 2)
    const postfix = match.substring(match.length - 2)
    const message = match.substring(2, match.length - 2)
    if (message.substring(0, 1) === 'É') {
        const [type, data] = [message.substring(1, message.indexOf(" ")), message.substring(message.indexOf(" "))]
        const parsed = JSON.parse(data)
        client.sendEvent(`gmcp.${type}`, parsed)
        if (type === "gmcp_msgs") {
            let data = atob(parsed.text)
            data = client.onLine(data)
            parsed.text = btoa(data)
            match = `${prefix}É${type} ${JSON.stringify(parsed)}${postfix}`
            client.sendEvent(`gmcp_msg.${parsed.type}`, parsed)
        }
    }
    return gmcpParseOption(match)
}
Input.send = (command: string) => {
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


const aliases = [
    {
        pattern: /\/fake (.*)/, callback: (matches: RegExpMatchArray) => {
            // @ts-ignore
            return Output.send(Text.parse_patterns(client.onLine(matches[1])));
        }
    },
    {
        pattern: /\/cofnij$/, callback: () => {
            client.mapHelper.moveBack();
        }
    },
    {
        pattern: /\/move (.*)$/, callback: (matches: RegExpMatchArray) => {
            client.mapHelper.move(matches[1]);
        }
    },
    {
        pattern: /\/ustaw (.*)$/, callback: (matches: RegExpMatchArray) => {
            client.mapHelper.setMapRoomById(parseInt(matches[1]));
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
    }
]

window.addEventListener('map-loaded', event => {
    const port: Port = chrome.runtime.connect((<CustomEvent>event).detail)
    client.connect(port)
})

/*
    Blockers
 */
import blockers from './blockers.json'
import Port = chrome.runtime.Port;

blockers.forEach(blocker => {
    let blockerPattern = blocker.type === "0" ? blocker.pattern : new RegExp(blocker.pattern)
    client.Triggers.registerTrigger(blockerPattern, (): undefined => {
        client.sendEvent('moveBack');
    }, "blocker")
})

/*
    People
 */
new People(client)

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

client.Triggers.registerTrigger(/^(?!Ktos|Jakis|Jakas).*(Doplynelismy.*(Mozna|w calej swej)|Marynarze sprawnie cumuja)/, (): undefined => {
    client.playSound("beep")
    client.FunctionalBind.set("zejdz ze statku", () => {
        Input.send("zejdz ze statku")
        client.sendEvent('refreshPositionWhenAble')
    })
})

window["clientExtension"] = client