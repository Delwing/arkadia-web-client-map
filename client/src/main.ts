import Client from "./Client";
import People from "./People";
import registerLuaGagTriggers from "./scripts/./luaGags";
import { stripPolishCharacters } from "./stripPolishCharacters";

const gmcpParseOption = Gmcp.parse_option_subnegotiation
export const rawOutputSend = Output.send
export const rawInputSend = Input.send

export const client = new Client()
window['clientExtension'] = client

Gmcp.parse_option_subnegotiation = (match) => {
    const prefix = match.substring(0, 2)
    const postfix = match.substring(match.length - 2)
    const message = match.substring(2, match.length - 2)
    if (message.substring(0, 1) === 'É') {
        const [type, data] = [
            message.substring(1, message.indexOf(' ')),
            message.substring(message.indexOf(' '))
        ]
        const parsed = JSON.parse(data)
        client.sendEvent('gmcp', { path: type, value: parsed })
        client.sendEvent(`gmcp.${type}`, parsed)
        if (type === 'gmcp_msgs') {
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
    if (command) {
        command = stripPolishCharacters(command)
    }
    client.sendCommand(command ?? '')
}

const aliases = client.aliases
aliases.push(
    {
        pattern: /\/fake (.*)/,
        callback: (matches: RegExpMatchArray) => {
            // @ts-ignore
            return Output.send(Text.parse_patterns(client.onLine(matches[1])))
        }
    },
    {
        pattern: /\/cofnij$/,
        callback: () => {
            client.Map.moveBack()
        }
    },
    {
        pattern: /\/move (.*)$/,
        callback: (matches: RegExpMatchArray) => {
            client.Map.move(matches[1])
        }
    },
    {
        pattern: /\/ustaw (.*)$/,
        callback: (matches: RegExpMatchArray) => {
            client.Map.setMapRoomById(parseInt(matches[1]))
        }
    },
    {
        pattern: /\/prowadz (.*)$/,
        callback: (matches: RegExpMatchArray) => {
            client.sendEvent('leadTo', matches[1])
        }
    },
    {
        pattern: /\/prowadz-$/,
        callback: () => {
            client.sendEvent('leadTo')
        }
    },
    {
        pattern: /\/zlok$/,
        callback: () => {
            client.Map.refresh()
        }
    }
)

/*
    Blockers
 */
import blockers from './blockers.json'

blockers.forEach(blocker => {
    let blockerPattern = blocker.type === "0" ? blocker.pattern : new RegExp(blocker.pattern)
    client.Triggers.registerTrigger(blockerPattern, (): undefined => {
        client.Map.moveBack()
    }, 'blocker')
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


client.Triggers.registerTrigger(/^.*[pP]odazasz (|skradajac sie )za (.*)\.$/, (_, __, matches): undefined => {
    const tokenized = matches[2].split(' ')
    const direction = tokenized[tokenized.length - 1]
    const result = client.Map.move(direction)
    if (result.moved) {
        return;
    }
    client.Map.followMove(matches[2])
}, 'follow')

client.Triggers.registerTrigger('Wykonuje komende \'idz ', (): undefined => {
    client.sendEvent('refreshPositionWhenAble')
})

client.Triggers.registerTrigger('ENTER by przejsc dalej', (): string => {
    client.sendCommand('')
    return ""
})

import initShips from './scripts/ships'
import initBuses from './scripts/buses'
import initGates from './scripts/gates'
import initAttackBeep from './scripts/attackBeep'
import initLamp from './scripts/lamp'
import initBinds from './scripts/binds'
import initIdz from './scripts/idz'

initShips(client)
initBuses(client)
initGates(client)
initAttackBeep(client)
initLamp(client)
initBinds(client, aliases)
initIdz(client, aliases)

import initKillTrigger from './scripts/kill'
import initEscape from './scripts/escape'
initKillTrigger(client, aliases)
initEscape(client)

import ItemCollector from './scripts/itemCollector'

const itemCollector = new ItemCollector(client);
(client as any).ItemCollector = itemCollector;

aliases.push({
    pattern: /\/zbieraj_extra(.*)/,
    callback: (matches: RegExpMatchArray) => {
        const strTrim = (matches[1] || '').trim()
        itemCollector.addExtra(strTrim)
    }
})

aliases.push({
    pattern: /\/nie_zbieraj_extra(.*)/,
    callback: (matches: RegExpMatchArray) => {
        const strTrim = (matches[1] || '').trim()
        if (strTrim !== '') {
            itemCollector.removeExtra(strTrim, false)
        } else {
            itemCollector.removeExtra('', true)
        }
    }
})

import initContainers from './scripts/prettyContainers'

initContainers(client)

import initBagManager from './scripts/bagManager'
import initDeposits from './scripts/deposits'
import initHerbShop from './scripts/herbShop'
import initArmorShop from './scripts/armorShop'
import initHerbCounter from './scripts/herbCounter'

initBagManager(client, aliases)
initDeposits(client, aliases)
initHerbShop(client)
initArmorShop(client)
initHerbCounter(client, aliases)

import initLvlCalc from './scripts/lvlCalc'
import initItemCondition from './scripts/itemCondition'
import initInvite from './scripts/invite'
import initObjectAliases from './scripts/objectAliases'
import initMagicKeys from './scripts/magicKeys'
import initMagics from './scripts/magics'
import registerGagTriggers from './scripts/gags'
import initLeaderAttackWarning from './scripts/leaderAttackWarning'
import initBreakItem from './scripts/breakItem'
import initPriceEvaluation from './scripts/priceEvaluation'
import initExternalScripts from './scripts/externalScripts'
import initUserAliases from './scripts/userAliases'
import initWeaponEvaluation from './scripts/weaponEvaluation'

initLvlCalc(client, aliases)
initItemCondition(client)
initInvite(client)
initObjectAliases(client, aliases)
initMagicKeys(client)
initMagics(client)
initPriceEvaluation(client)
initLeaderAttackWarning(client)
initBreakItem(client)
initExternalScripts(client)
initUserAliases(client, aliases)
initWeaponEvaluation(client)

