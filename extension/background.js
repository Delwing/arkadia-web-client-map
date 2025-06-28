chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut === 'reload') {
        chrome.runtime.reload()
    }
})

chrome.runtime.onConnectExternal.addListener(function (port) {
    chrome.storage.local.onChanged.addListener(msg => {
        Object.entries(msg).forEach(([key, value]) => {
            if (key === 'settings' || key === 'npc') {
                port.postMessage({ [key]: value.newValue })
            }
            port.postMessage({ storage: { key, value: value.newValue } })
        })
    })

    chrome.storage.local.get(null).then(items => {
        Object.entries(items).forEach(([key, value]) => {
            if (key === 'settings' || key === 'npc') {
                port.postMessage({ [key]: value })
            }
            port.postMessage({ storage: { key, value } })
        })
    })

    port.onMessage.addListener(msg => {
        if (msg.type === 'NEW_NPC') {
            chrome.storage.local.get('npc').then(data => {
                const npc = data.npc ?? []
                npc.push({name: msg.name, loc: msg.loc})
                chrome.storage.local.set({ npc: npc })
            })
        }
        if (msg.type === 'SET_STORAGE') {
            const entry = {}
            entry[msg.key] = msg.value
            chrome.storage.local.set(entry)
        }
    })
});


function loadIframe(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: async () => {

            let download = async (url, ttl) => {
                return chrome.storage.local.get(url).then(item => {
                    const cacheContent = item[url]
                    if (cacheContent && cacheContent.value && cacheContent.cacheTime && cacheContent.cacheTime + cacheContent.ttl > Date.now()) {
                        return cacheContent.value;
                    } else {
                        return fetch(url).then(data => data.json()).then(data => {
                            let entry = {}
                            entry[url] = {value: data, cacheTime: Date.now(), ttl: ttl}
                            chrome.storage.local.set(entry)
                            return data;
                        })
                    }
                })
            }

            const size = 355
            const oldIframe = document.getElementById('map-placeholder');

            if (oldIframe) {
                oldIframe.remove();
            }
            const rightPanel = document.body.querySelector("#panel_elems_right")

            const div = document.createElement('div')
            div.setAttribute('style', `width: ${size}px;height: ${size}px; position: fixed; right: 255px; top: 60px;`);
            div.setAttribute('id', 'map-placeholder')

            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', 'cm-frame');
            iframe.setAttribute('style', `width: ${size};height: ${size}; border: 1px solid #323232;`);
            iframe.setAttribute('allow', '');
            iframe.src = chrome.runtime.getURL('embedded.html');

            div.appendChild(iframe)

            rightPanel.prepend(div);

            Promise.all([
                download('https://delwing.github.io/arkadia-mapa/data/mapExport.json', 60 * 60 * 24),
                download('https://delwing.github.io/arkadia-mapa/data/colors.json', 60 * 60 * 24)
            ]).then(([mapData, colors]) => {
                window.dispatchEvent(new CustomEvent('map-ready', {detail: {mapData, colors}}))
                iframe.contentWindow?.postMessage({mapData: mapData, colors: colors}, '*')
            })

            let init = (settings) => {
                const replaceMap = settings?.replaceMap
                const size = replaceMap ? 215 : 355;
                document.getElementById('minimap_output').style.display = replaceMap ? 'none' : 'block';
                document.getElementById('map-placeholder').setAttribute('style', `width: ${size}px;height: ${size}px;${!replaceMap ? ' position: fixed; right: 255px; top: 60px;' : ''}`);
                iframe.setAttribute('style', `width: ${size}px;height: ${size}px; border: 1px solid #323232;`);

            }

            chrome.storage.local.get('settings').then(value => {
                init(value.settings);
                window.dispatchEvent(new CustomEvent('ready'))
            })
            chrome.storage.local.onChanged.addListener(ev => {
                if (ev.settings) {
                    init(ev.settings.newValue)
                }
            })

            const buttonPanel = document.body.querySelector('#panel_bottom')

            const newPanel = document.createElement('div')
            newPanel.setAttribute('id', 'additional-buttons')
            buttonPanel.appendChild(newPanel)

            window.dispatchEvent(new CustomEvent('extension-loaded', {detail: chrome.runtime.id}))
        }
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'ready') {
        loadIframe(sender.tab.id);
    }
});
