chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut === 'reload') {
        chrome.runtime.reload()
    }
})

function loadIframe(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: () => {

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
            iframe.setAttribute('style', `width: ${size}px;height: ${size}px; border: 1px solid #323232;`);
            iframe.setAttribute('allow', '');
            iframe.src = chrome.runtime.getURL('embedded.html');

            div.appendChild(iframe)

            rightPanel.prepend(div);

            window.dispatchEvent(new CustomEvent('ready'))

            download('https://delwing.github.io/arkadia-mapa/data/npc.json', 60 * 60 * 24).then(item => window.dispatchEvent(new CustomEvent('npc', {detail: item})))
            Promise.all([
                download('https://delwing.github.io/arkadia-mapa/data/mapExport.json', 60 * 60 * 24),
                download('https://delwing.github.io/arkadia-mapa/data/colors.json', 60 * 60 * 24)
            ]).then(([mapData, colors]) => {
                iframe.contentWindow?.postMessage({mapData: mapData, colors: colors}, '*')
            })

            const buttonPanel = document.body.querySelector('#panel_bottom')

            const newPanel = document.createElement('div')
            newPanel.setAttribute('id', 'additional-buttons')
            buttonPanel.appendChild(newPanel)
        }
    })
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message === 'ready') {
        loadIframe(sender.tab.id);
    }
});

// chrome.action.onClicked.addListener(async function (tab) {
//     loadIframe(tab.id)
// })