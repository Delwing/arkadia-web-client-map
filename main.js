function createEvent(type, payload) {
    return {
        type: type,
        data: payload
    }
}

function sendEvent(type, payload) {
    const frame = window.document.getElementById('cm-frame');
    return frame?.contentWindow.postMessage(createEvent(type, payload), '*', );
}



window.postMessage('message')

const originalSend = Input.send
const originalSetPosition = Maps.set_position
const originalUnsetPosition = Maps.unset_position


window.addEventListener('message', (event) => {
    if (event.data.type === 'command') {
        originalSend(event.data.payload)
    }
})

window.addEventListener('ready', () => {
    Input.send = (command) => {
        sendEvent('command', command)
    }
    Maps.refresh_position = () => {
        return sendEvent('refreshMapPosition')
    };
    Maps.set_position = (e) => {
        originalSetPosition(e)
        return sendEvent('mapPosition', Maps.data)
    };
    Maps.unset_position = (e) => {
        originalUnsetPosition(e)
        return sendEvent('mapPosition', {})
    };
})