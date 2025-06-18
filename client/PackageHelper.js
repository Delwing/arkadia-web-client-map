import {colorString} from "./ClientExtension";

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

const tag = "packageHelper";
const pickCommand = "wybierz paczke"
const packageLineRegex = /^ \|.*?(?<number>\d+)?\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr|(?<time>\d+))/

export default class PackageHelper {

    clientExtension
    npcs = {}
    enabled = false;
    packages = []
    commandListener;
    pick;

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
            const packageLineTrigger = this.clientExtension.registerTrigger(packageLineRegex, (rawLine, line, matches) => {
                const name = matches.groups.name
                this.packages.push({name: name, time: matches.groups.time})
                return this.npcs[name] ? colorString(rawLine, matches.groups.name, 50) : rawLine
            })
            // if (this.commandListener) {
            //     this.commandListener();
            //     delete this.commandListener
            // }
            // this.commandListener = this.clientExtension.addEventListener("command", ({detail: command}) => {
            //     if (!command.startsWith(pickCommand)) {
            //         return;
            //     }
            //     this.pick = command.substring(pickCommand.length + 1).trim()
            //     const toRemove = this.clientExtension.registerOneTimeTrigger(/Pracownik poczty przekazuje ci jakas paczke\./, (_, __, ___, uuid) => {
            //         this.currentPackage = this.packages[this.pick - 1]
            //         console.log(this.currentPackage)
            //     })
            // })
            this.clientExtension.registerOneTimeTrigger(/Symbolem \* oznaczono przesylki ciezkie/, () => {
                this.clientExtension.removeTrigger(packageLineTrigger)
                //console.log(this.packages)
            })
        })
        this.clientExtension.println(`Asystent paczek włączony.`)
    }

    disable() {
        this.clientExtension.triggers.removeByTag(tag)
        this.clientExtension.println(`Asystent paczek wyłączony.`)
    }

}