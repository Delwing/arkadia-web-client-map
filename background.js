chrome.action.onClicked.addListener(async function (tab) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => {
            const oldIframe = document.getElementById('map-placeholder');

            if (oldIframe) {
                oldIframe.remove();
                return;
            }

            document.getElementById("minimap_output").setAttribute('style', 'display: none;')

            const div = document.createElement('div')
            div.setAttribute('style', 'width: 315px;height: 315px;');
            div.setAttribute('id', 'map-placeholder')

            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', 'cm-frame');
            iframe.setAttribute('style', 'width: 315px;height: 315px; border: 1px solid #323232');
            iframe.setAttribute('allow', '');
            iframe.src = chrome.runtime.getURL('embedded.html');

            div.appendChild(iframe)

            document.body.querySelector("#panel_elems_right").prepend(div);

            window.dispatchEvent(new CustomEvent('ready'))
        }
    })
});