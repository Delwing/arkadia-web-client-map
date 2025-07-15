import people from './people.json'
import Client from "./Client";

export default class People {

    tag = 'people'
    client: Client
    guildFilter: string[] = []

    constructor(clientExtension: Client) {
        this.client = clientExtension
        this.client.addEventListener('settings', (event: CustomEvent) => {
            this.guildFilter = event.detail.guilds || []
            this.registerPeopleTriggers()
        })
    }

    registerPeopleTriggers() {
        this.client.Triggers.removeByTag(this.tag)
        let count = 0
        people.forEach(replacement => {
            if (!Array.isArray(this.guildFilter) || this.guildFilter.indexOf(replacement.guild) === -1) {
                return
            }
            count++
            this.client.Triggers.registerTokenTrigger(replacement.description, (rawLine, _line, matches) => {
                const index = matches.index
                return rawLine.substring(0, index + replacement.description.length) + ` \x1B[22;38;5;228m(${replacement.name} \x1B[22;38;5;210m${replacement.guild}\x1B[22;38;5;228m)` + rawLine.substring(index + replacement.description.length)
            }, this.tag)
        })
    }

}
