import {colorStringInLine, findClosestColor} from "./Colors";
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
const packageLineRegex = /^ \|\s*(?<heavy>\*)?\s*(?<number>\d+)\. (?<name>.*?)(?:, (?<city>[\w' ]+?))?\s+(?<gold>\d+)\/\s?(?<silver>\d+)\/\s?(?<copper>\d+)\s+(?:nieogr\.|(?<time>\d+))/
const packageTableRegex = /Tablica zawiera liste adresatow przesylek, ktore mozesz tutaj pobrac:[\s\S]*?Symbolem \* oznaczono przesylki ciezkie\./

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
            if (!this.enabled && event.detail.packageHelper) {
                this.init()
            } else {
                this.disable()
            }
        })
    }

    init() {
        this.enabled = true;
        this.client.Triggers.registerTrigger(/^Wypisano na niej duzymi literami: ([a-zA-Z ]+).*$/, (_rawLine, __, matches): undefined => {
            this.leadToPackage(toTitleCase(matches[1]));
        }, tag)
        this.client.Triggers.registerMultilineTrigger(packageTableRegex, this.packageTableCallback(), tag)
    }

    private onPackageList() {
        this.packages = []
        this.remover();
        this.remover = this.client.addEventListener("command", ({detail: command}) => this.handleCommand(command));
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
            return this.client.OutputHandler.makeClickable(colorStringInLine(rawLine, name, colorCode), name, () => {
                this.client.sendCommand("wybierz paczke " + index)
            }, "wybierz paczke " + index)
        };
    }

    private packageTableCallback() {
        const lineCallback = this.packageLineCallback();
        const widthLimit = 78;
        return (raw: string): string => {
            this.onPackageList();
            const lines = raw.split('\n');
            if (this.client.contentWidth && this.client.contentWidth < widthLimit) {
                return lines
                    .map(line => {
                        const matches = line.match(packageLineRegex);
                        if (!matches) {
                            return line;
                        }
                        const index = matches.groups.number;
                        const name = matches.groups.name;
                        const city = matches.groups.city ? `, ${matches.groups.city}` : '';
                        const heavy = matches.groups.heavy ? '* ' : '';
                        const first = `${heavy}${index}. ${name}${city}`;
                        const colorCode = this.npc[name] ? KNOWN_NPC_COLOR : UNKNOWN_NPC_COLOR;
                        this.packages.push({ name, time: matches.groups.time });
                        const clickable = this.client.OutputHandler.makeClickable(
                            colorStringInLine(first, name, colorCode),
                            name,
                            () => {
                                this.client.sendCommand('wybierz paczke ' + index);
                            },
                            'wybierz paczke ' + index
                        );
                        const time = matches.groups.time ? matches.groups.time : 'nieogr.';
                        const second = `  ${matches.groups.gold}/${matches.groups.silver}/${matches.groups.copper} ${time}`;
                        return `${clickable}\n${second}`;
                    })
                    .join('\n');
            }
            return lines
                .map(line => {
                    const matches = line.match(packageLineRegex);
                    if (matches) {
                        return lineCallback(line, '', matches) || line;
                    }
                    return line;
                })
                .join('\n');
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
                        return this.client.sendCommand('oddaj paczke');
                    })
                }, {once: true})
            }
        }
        this.client.addEventListener('enterLocation', this.locationListener)
    }

    disable() {
        this.client.Triggers.removeByTag(tag)
    }

}
