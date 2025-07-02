import {colorString, findClosestColor} from "./Colors";
import Client from "./Client";
import { Trigger } from "./Triggers";

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

const tag = "packageHelper";
const pickCommand = "wybierz paczke"
const packageLineRegex = /^ \|.*?(?<number>\d+)?\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr|(?<time>\d+))/

const KNOWN_NPC_COLOR = findClosestColor('#63ba41');
const UNKNOWN_NPC_COLOR = findClosestColor('#aaaaaa');

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

    deliveryTrigger: Trigger;

    constructor(clientExtension: Client) {
        this.client = clientExtension
        this.client.addEventListener('npc', (event) => {
            event.detail.forEach((item: { name: string | number; loc: number; }) => this.npc[item.name] = item.loc)
        })

        this.client.addEventListener('settings', (event) => {
            this.enabled = event.detail.packageHelper;
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
    }

    private onPackageList() {
        this.packages = []
        const packageLineTrigger = this.client.Triggers.registerTrigger(packageLineRegex, this.packageLineCallback())
        this.remover();
        this.remover = this.client.addEventListener("command", ({detail: command}) => this.handleCommand(command));
        this.client.Triggers.registerOneTimeTrigger(/Symbolem \* oznaczono przesylki ciezkie/, (): undefined => {
            this.client.Triggers.removeTrigger(packageLineTrigger)
        })
    }

    private handleCommand(command: string) {
        if (!command.startsWith(pickCommand)) {
            return;
        }
        this.pick = parseInt(command.substring(pickCommand.length + 1).trim())
        this.client.Triggers.registerOneTimeTrigger(/^.* przekazuje ci jakas paczke\./, (): undefined => {
            this.currentPackage = this.packages[this.pick - 1]
            this.leadToPackage(this.currentPackage.name)
            this.deliveryTrigger = this.client.Triggers.registerOneTimeTrigger(/^(Oddajesz|Zwracasz) pocztowa paczke/, (_, __, matches): undefined => {
                if (matches[1] === 'Oddajesz') {
                    if (!this.npc[this.currentPackage.name]) {
                        this.client.println(`Nowy adresat: ${this.currentPackage.name} | ${this.client.Map.currentRoom.id}`)
                        this.client.port.postMessage({
                            type: 'NEW_NPC',
                            name: this.currentPackage.name,
                            loc: this.client.Map.currentRoom.id
                        })
                    }
                }
                this.currentPackage = undefined;
            })
        })
    }

    private packageLineCallback() {
        return (rawLine: string, _line: string, matches: RegExpMatchArray) => {
            const index = matches.groups.number
            const name = matches.groups.name
            this.packages.push({name: name, time: matches.groups.time})
            const colorCode = this.npc[name] ? KNOWN_NPC_COLOR : UNKNOWN_NPC_COLOR;
            return this.client.OutputHandler.makeClickable(colorString(rawLine, name, colorCode), name, () => {
                Input.send("wybierz paczke " + index)
            }, "wybierz paczke " + index)
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
                this.client.addEventListener('gmcp.objects.data', () => {
                    this.client.FunctionalBind.set('oddaj paczke', () => {
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
