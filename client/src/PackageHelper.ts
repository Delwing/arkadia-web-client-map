import {colorString, findClosestColor} from "./Colors";
import Client from "./Client";

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

    private client: Client
    npc: Record<string, number> = {}
    enabled = false;

    private packages = []
    private remover = () => {
    };
    private locationListener;

    private pick: number
    private currentPackage: { name: string; time?: number };

    constructor(clientExtension: Client) {
        this.client = clientExtension
        window.addEventListener('npc', ({detail: npc}: CustomEvent) => {
            npc.forEach(item => this.npc[item.name] = item.loc)
        })

        this.client.addEventListener('settings', (event) => {
            this.enabled = event.detail.settings.packageHelper;
            if (this.enabled) {
                this.init()
            } else {
                this.disable()
            }
        })
    }

    init() {
        this.client.Triggers.registerTrigger(/^Wypisano na niej duzymi literami: ([a-zA-Z ]+).*$/, (_rawLine, __, matches): undefined => {
            this.leadToPackage(toTitleCase(matches[1]));
        }, tag)
        this.client.Triggers.registerTrigger(/Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac/, (): undefined => {
            this.onPackageList();
        })
        this.client.println(`Asystent paczek włączony.`)
    }

    private onPackageList() {
        this.packages = []
        const packageLineTrigger = this.client.Triggers.registerTrigger(packageLineRegex, this.packageLineCallback())
        this.remover();
        this.remover = this.client.addEventListener("command", ({detail: command}) => this.handleCommand(command));
        this.client.Triggers.registerOneTimeTrigger(/Symbolem \* oznaczono przesylki ciezkie/, (): undefined => {
            this.client.Triggers.removeTrigger(packageLineTrigger)
            this.client.println(this.packages)
        })
    }

    private handleCommand(command: string) {
        if (!command.startsWith(pickCommand)) {
            return;
        }
        this.pick = parseInt(command.substring(pickCommand.length + 1).trim())
        this.client.Triggers.registerOneTimeTrigger(/Pracownik poczty przekazuje ci jakas paczke\./, (): undefined => {
            this.currentPackage = this.packages[this.pick - 1]
            this.leadToPackage(this.currentPackage.name)
        })
    }

    private packageLineCallback() {
        return (rawLine: string, _line: string, matches: RegExpMatchArray) => {
            const name = matches.groups.name
            this.packages.push({name: name, time: matches.groups.time})
            return this.npc[name] ? colorString(rawLine, matches.groups.name, findClosestColor('#63ba41')) : rawLine
        };
    }

    private leadToPackage(name: string) {
        const location = this.npc[name]
        if (location) {
            this.client.sendEvent('leadTo', location)
        }
        if (this.locationListener) {
            this.client.removeEventListener('enterLocation', this.locationListener)
        }
        this.locationListener = ({detail: {id: roomId}}) => {
            if (roomId === location) {
                this.client.removeEventListener('enterLocation', this.locationListener)
                const button = this.client.createButton('oddaj paczke', () => {
                    Input.send("oddaj paczke")
                    button.remove()
                })
                this.client.addEventListener('gmcp.objects.data', () => {
                    this.client.FunctionalBind.set('oddaj paczke', () => {
                        button?.remove()
                        return Input.send('oddaj paczke');
                    })
                }, {once: true})
            }
        }
        this.client.addEventListener('enterLocation', this.locationListener)
    }

    disable() {
        this.client.Triggers.removeByTag(tag)
        this.client.println(`Asystent paczek wyłączony.`)
    }

}