import people from './people.json'
import Client from "./Client";
import { color, RESET, findClosestColor } from './Colors';

export default class People {

    tag = 'people'
    client: Client
    guildFilter: string[] = []
    enemyGuilds: string[] = []

    constructor(clientExtension: Client) {
        this.client = clientExtension
        this.client.addEventListener('settings', (event: CustomEvent) => {
            this.guildFilter = event.detail.guilds || []
            this.enemyGuilds = event.detail.enemyGuilds || []
            this.registerPeopleTriggers()
        })
    }

    registerPeopleTriggers() {
        this.client.Triggers.removeByTag(this.tag)
        const RED = findClosestColor('#ff0000')
        const addedNames = new Set<string>()
        people.forEach(replacement => {
            const inGuild = this.guildFilter.includes(replacement.guild)
            const isEnemy = this.enemyGuilds.includes(replacement.guild)
            if (!inGuild && !isEnemy) {
                return
            }
            const callback = (rawLine: string, _line: string, matches: RegExpMatchArray) => {
                const index = matches.index || 0
                const token = matches[0]
                const prefix = rawLine.substring(0, index)
                const suffix = rawLine.substring(index + token.length)
                let highlighted = token
                if (isEnemy) {
                    highlighted = color(RED) + token + RESET
                }
                return prefix + highlighted + ` \x1B[22;38;5;228m(${replacement.name} \x1B[22;38;5;210m${replacement.guild}\x1B[22;38;5;228m)` + suffix
            }
            this.client.Triggers.registerTokenTrigger(replacement.description, callback, this.tag)
            if (isEnemy) {
                const key = `${replacement.name}|${replacement.guild}`
                if (!addedNames.has(key)) {
                    this.client.Triggers.registerTokenTrigger(replacement.name, callback, this.tag)
                    addedNames.add(key)
                }
            }
        })
    }

}
