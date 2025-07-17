import People from "./People";
import registerLuaGagTriggers from "./scripts/./luaGags";

import blockers from './blockers.json'
import initShips from './scripts/ships'
import initBuses from './scripts/buses'
import initGates from './scripts/gates'
import initAttackBeep from './scripts/attackBeep'
import initLamp from './scripts/lamp'
import initBinds from './scripts/binds'
import initIdz from './scripts/idz'
import initKillTrigger from './scripts/kill'
import initEscape from './scripts/escape'
import { initItemCollector } from './scripts/itemCollector'
import initContainers from './scripts/prettyContainers'
import initBagManager from './scripts/bagManager'
import initDeposits from './scripts/deposits'
import initHerbShop from './scripts/herbShop'
import initArmorShop from './scripts/armorShop'
import initHerbCounter from './scripts/herbCounter'
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
import Client from "./Client";


export function registerScripts(client: Client) {


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

    initShips(client)
    initBuses(client)
    initGates(client)
    initAttackBeep(client)
    initLamp(client)
    initBinds(client, aliases)
    initIdz(client, aliases)
    initKillTrigger(client, aliases)
    initEscape(client)


    const itemCollector = initItemCollector(client, aliases);
    (client as any).ItemCollector = itemCollector;


    initContainers(client)
    initBagManager(client, aliases)
    initDeposits(client, aliases)
    initHerbShop(client)
    initArmorShop(client)
    initHerbCounter(client, aliases)
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

}