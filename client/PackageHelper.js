function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

const tag = "packageHelper";

const packageLineRegex = /^ \|.*?(?<index>'\d+)?\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr|(?<time>'\d+))/

export default class PackageHelper {

    clientExtension
    npcs = {}
    enabled = false;
    packages = []

    constructor(clientExtension) {
        this.clientExtension = clientExtension
        window.addEventListener('npc', ({detail: npc}) => {
            npc.forEach(item => this.npcs[item.name] = item.loc)
        })

        this.clientExtension.addEventListener('settings', (event) => {
            this.enabled = event.detail.settings.packageHelper;
            if (this.enabled) {
                this.init()
            } else {
                this.disable()
            }
        })
    }

    init() {
        this.clientExtension.registerTrigger(/^Wypisano na niej duzymi literami: ([a-zA-Z ]+).*$/, (rawLine, __, matches) => {
            const name = toTitleCase(matches[1])
            const location = this.npcs[name]
            if (location) {
                this.clientExtension.sendEvent('leadTo', location)
            }
            if (this.listener) {
                this.clientExtension.removeEventListener('enterLocation', this.listener)
            }
            this.listener = ({detail: {id: roomId, room: room}}) => {
                if (roomId === location) {
                    this.clientExtension.removeEventListener('enterLocation', this.listener)
                    const button = this.clientExtension.createButton('oddaj paczke', () => {
                        Input.send("oddaj paczke")
                        button.remove()
                    })
                    this.clientExtension.addEventListener('gmcp.objects.data', () => {
                        this.clientExtension.setFunctionalBind('oddaj paczke', () => {
                            button?.remove()
                            return Input.send('oddaj paczke');
                        })
                    }, {once: true})
                }
            }
            this.clientExtension.addEventListener('enterLocation', this.listener)
        }, tag)
        this.clientExtension.registerTrigger(/Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac/, () => {
            this.packages = []
            const triggers = Object.entries(this.npcs).map(item => {
                const name = item[0]
                return this.clientExtension.registerTrigger(new RegExp(name + "\\b"), (rawLine, line, matches) => {
                    line.match(packageLineRegex)
                    const index = matches.index
                    return rawLine.substring(0, index) + `\x1B[22;38;5;50m${name}\x1B[0m`  + rawLine.substring(index + name.length)
                })
            })
            this.clientExtension.registerOneTimeTrigger(/Symbolem \* oznaczono przesylki ciezkie/, () => {
                triggers?.forEach(trigger => {this.clientExtension.removeTrigger(trigger)})
            })
        })
        this.clientExtension.println(`Asystent paczek włączony.`)
    }

    disable() {
        this.clientExtension.triggers.removeByTag(tag)
        this.clientExtension.println(`Asystent paczek wyłączony.`)
    }

}