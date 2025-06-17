
export default class MapHelper {

    clientExtension
    drinkableButton

    constructor(clientExtension) {
        this.clientExtension = clientExtension
        this.clientExtension.addEventListener('enterLocation', (event) => this.handleNewLocation(event.detail))
    }

    handleNewLocation({id: id, room: room}) {
        this.clientExtension.clearFunctionalBind();
        if (this.drinkableButton) {
            this.drinkableButton.remove()
            delete this.drinkableButton
        }
        if (room.userData.drinkable) {
            this.clientExtension.setFunctionalBind("napij sie do syta wody", () => Input.send("napij sie do syta wody"))
            this.drinkableButton = this.clientExtension.createButton("napij sie do syta wody", () => Input.send("napij sie do syta wody"))

        }
    }

}