function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export default class PackageHelper {

    clientExtension
    npcs = {}

    constructor(clientExtension) {
        this.clientExtension = clientExtension
        window.addEventListener('npc', ({detail: npc}) => {
            npc.forEach(item => this.npcs[item.name] = item.loc)
        })

        clientExtension.registerTrigger(/^Wypisano na niej duzymi literami: ([a-zA-Z ]+).*$/, (_, __, matches) => {
            const name = toTitleCase(matches[1])
            const location = this.npcs[name]
            if (location) {
                clientExtension.sendEvent('leadTo', location)
            }
            if (this.listener) {
                clientExtension.removeEventListener('enterLocation', this.listener)
            }
            this.listener = ({detail: roomId}) => {
                if (roomId === location) {
                    clientExtension.removeEventListener('enterLocation', this.listener)
                    const button = clientExtension.createButton('oddaj paczke', () => {
                        Input.send("oddaj paczke")
                        button.remove()
                    })
                    clientExtension.addEventListener('gmcp.objects.data', () => {
                        clientExtension.setFunctionalBind('oddaj paczke', () => {
                            button?.remove()
                            return Input.send('oddaj paczke');
                        })
                    }, {once: true})
                }
            }
            clientExtension.addEventListener('enterLocation', this.listener)
        })
    }

}