import Modal from "bootstrap/js/dist/modal";

interface UiSettings {
    contentFontSize: number;
    objectsFontSize: number;
    buttonSize: number;
    mapScale: number;
}

const defaultSettings: UiSettings = {
    contentFontSize: 0.775,
    objectsFontSize: 0.6,
    buttonSize: 1,
    mapScale: 90,
};

function apply(settings: UiSettings) {
    const content = document.getElementById('main_text_output_msg_wrapper');
    if (content) {
        content.style.fontSize = settings.contentFontSize + 'rem';
    }
    const objects = document.getElementById('objects-list');
    if (objects) {
        objects.style.fontSize = settings.objectsFontSize + 'rem';
    }
    document.querySelectorAll<HTMLButtonElement>('button').forEach(btn => {
        btn.style.fontSize = settings.buttonSize + 'rem';
    });
    if ((window as any).embedded?.renderer?.controls) {
        (window as any).embedded.renderer.controls.view.zoom = settings.mapScale;
        (window as any).embedded.refresh();
    }
}

function load(): UiSettings {
    try {
        const raw = localStorage.getItem('uiSettings');
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultSettings, ...parsed };
        }
    } catch {
        // ignore malformed data
    }
    return { ...defaultSettings };
}

function save(settings: UiSettings) {
    localStorage.setItem('uiSettings', JSON.stringify(settings));
}

export default function initUiSettings() {
    const button = document.getElementById('ui-settings-button') as HTMLButtonElement | null;
    const modalEl = document.getElementById('ui-settings-modal');
    if (!button || !modalEl) return;

    const modal = new Modal(modalEl);
    const contentInput = modalEl.querySelector('#ui-content-font') as HTMLInputElement;
    const objectsInput = modalEl.querySelector('#ui-objects-font') as HTMLInputElement;
    const buttonInput = modalEl.querySelector('#ui-button-size') as HTMLInputElement;
    const mapInput = modalEl.querySelector('#ui-map-scale') as HTMLInputElement;
    const saveBtn = modalEl.querySelector('#ui-settings-save') as HTMLButtonElement;

    let current = load();
    contentInput.value = String(current.contentFontSize);
    objectsInput.value = String(current.objectsFontSize);
    buttonInput.value = String(current.buttonSize);
    mapInput.value = String(current.mapScale);
    apply(current);

    function read(): UiSettings {
        return {
            contentFontSize: parseFloat(contentInput.value) || defaultSettings.contentFontSize,
            objectsFontSize: parseFloat(objectsInput.value) || defaultSettings.objectsFontSize,
            buttonSize: parseFloat(buttonInput.value) || defaultSettings.buttonSize,
            mapScale: parseFloat(mapInput.value) || defaultSettings.mapScale,
        };
    }

    saveBtn.addEventListener('click', () => {
        current = read();
        save(current);
        apply(current);
        modal.hide();
    });

    button.addEventListener('click', () => {
        modal.show();
    });
}

