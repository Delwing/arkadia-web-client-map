import people from './people.json'
import ClientExtension from "./ClientExtension";

export default class People {

    tag = 'people'
    clientExtension: ClientExtension
    guildFilter: string[] = []

    constructor(clientExtension: ClientExtension) {
        this.clientExtension = clientExtension
        this.clientExtension.addEventListener('settings', (event: CustomEvent) => {
            this.guildFilter = event.detail.settings.guilds
            this.registerPeopleTriggers()
        })
    }

    registerPeopleTriggers() {
        this.clientExtension.Triggers.removeByTag(this.tag)
        let count = 0
        people.forEach(replacement => {
            if (this.guildFilter.indexOf(replacement.guild) === -1) {
                return
            }
            count++
            this.clientExtension.Triggers.registerTrigger(replacement.description, (rawLine, _line, matches) => {
                const index = matches.index
                return rawLine.substring(0, index + replacement.description.length) + ` \x1B[22;38;5;228m(${replacement.name} \x1B[22;38;5;210m${replacement.guild}\x1B[22;38;5;228m)` + rawLine.substring(index + replacement.description.length)
            }, this.tag)
        })
        this.clientExtension.println(`Przeladowano triggery bazy postaci [${count}].`)
    }

}