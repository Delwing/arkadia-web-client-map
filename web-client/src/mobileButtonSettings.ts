import Modal from "bootstrap/js/dist/modal";

export type MacroType = 'functional' | 'zList' | 'zaList' | 'command' | 'specialExit' | 'kierunek';

export interface ButtonSetting {
    macro: MacroType;
    label: string;
    color: string;
    command?: string;
    direction?: string;
}

const defaultSettings: Record<string, ButtonSetting> = {
    'z-list-toggle': { macro: 'zList', label: '/z', color: '#87CEEB' },
    'zas-list-toggle': { macro: 'zaList', label: '/zas', color: '#87CEEB' },
    'go-button': { macro: 'command', label: '/go', color: '#87CEEB', command: '/go' },
    'bracket-right-button': { macro: 'functional', label: ']', color: '#87CEEB' },
    'button-1': { macro: 'command', label: 'wesprzyj', color: '#87CEEB', command: 'wesprzyj' },
    'button-2': { macro: 'command', label: '/z cel', color: '#87CEEB', command: '/z' },
    'button-3': { macro: 'command', label: '/za cel', color: '#87CEEB', command: '/za' },
    'c-button': { macro: 'command', label: 'zerknij', color: '#6CA6CD', command: 'zerknij' },
    'u-button': { macro: 'kierunek', label: 'u', color: '#6CA6CD', command: 'u', direction: 'u' },
    'd-button': { macro: 'kierunek', label: 'd', color: '#6CA6CD', command: 'd', direction: 'd' },
    'special-exit-button': { macro: 'specialExit', label: 'sp ex', color: '#6CA6CD' },
    'nw-button': { macro: 'kierunek', label: '↖', color: '#6CA6CD', command: 'nw', direction: 'nw' },
    'n-button': { macro: 'kierunek', label: '↑', color: '#6CA6CD', command: 'n', direction: 'n' },
    'ne-button': { macro: 'kierunek', label: '↗', color: '#6CA6CD', command: 'ne', direction: 'ne' },
    'w-button': { macro: 'kierunek', label: '←', color: '#6CA6CD', command: 'w', direction: 'w' },
    'e-button': { macro: 'kierunek', label: '→', color: '#6CA6CD', command: 'e', direction: 'e' },
    'sw-button': { macro: 'kierunek', label: '↙', color: '#6CA6CD', command: 'sw', direction: 'sw' },
    's-button': { macro: 'kierunek', label: '↓', color: '#6CA6CD', command: 's', direction: 's' },
    'se-button': { macro: 'kierunek', label: '↘', color: '#6CA6CD', command: 'se', direction: 'se' },
};

export function loadSettings(): Record<string, ButtonSetting> {
    try {
        const raw = localStorage.getItem('mobileButtonSettings');
        if (raw) {
            return { ...defaultSettings, ...JSON.parse(raw) };
        }
    } catch {}
    return { ...defaultSettings };
}

export function saveSettings(settings: Record<string, ButtonSetting>) {
    localStorage.setItem('mobileButtonSettings', JSON.stringify(settings));
}

export function applySettings(settings: Record<string, ButtonSetting>) {
    Object.entries(settings).forEach(([id, cfg]) => {
        const el = document.getElementById(id) as HTMLButtonElement | null;
        if (!el) return;
        el.textContent = cfg.label;
        el.style.backgroundColor = cfg.color;
        if (cfg.direction) {
            el.dataset.direction = cfg.direction;
        } else {
            el.removeAttribute('data-direction');
        }
    });
    if ((window as any).clientExtension?.eventTarget) {
        (window as any).clientExtension.eventTarget.dispatchEvent(
            new CustomEvent('mobileButtonsSettings', { detail: settings })
        );
    }
}

export default function initMobileButtonSettings() {
    const button = document.getElementById('mobile-buttons-button') as HTMLButtonElement | null;
    const modalEl = document.getElementById('mobile-buttons-modal');
    if (!button || !modalEl) return;

    const modal = new Modal(modalEl);
    const saveBtn = modalEl.querySelector('#mobile-buttons-save') as HTMLButtonElement;

    const sections = Array.from(modalEl.querySelectorAll<HTMLElement>('.mobile-button-config'));
    const previewButtons = Array.from(modalEl.querySelectorAll<HTMLButtonElement>('#mobile-buttons-preview button[data-button-id]'));
    const previewMap: Record<string, HTMLButtonElement> = {};
    const realMap: Record<string, HTMLButtonElement> = {};
    previewButtons.forEach(btn => {
        const id = btn.dataset.buttonId!;
        previewMap[id] = btn;
    });
    Object.keys(defaultSettings).forEach(id => {
        const el = document.getElementById(id) as HTMLButtonElement | null;
        if (el) realMap[id] = el;
    });
    const modalBody = modalEl.querySelector('.modal-body') as HTMLElement;
    let activeConfig: HTMLElement | null = null;

    const hideConfig = () => {
        if (activeConfig) {
            activeConfig.classList.add('d-none');
            activeConfig = null;
        }
    };

    let current = loadSettings();
    const applyLive = (id: string, labelVal: string, colorVal: string) => {
        const btn = realMap[id];
        if (btn) {
            btn.textContent = labelVal;
            btn.style.backgroundColor = colorVal;
        }
    };
    sections.forEach(section => {
        const id = section.dataset.buttonId!;
        const cfg = current[id] || defaultSettings[id];
        const preview = previewMap[id];
        const macro = section.querySelector('.mobile-button-macro') as HTMLSelectElement;
        const label = section.querySelector('.mobile-button-label') as HTMLInputElement;
        const color = section.querySelector('.mobile-button-color') as HTMLInputElement;
        const command = section.querySelector('.mobile-button-command') as HTMLTextAreaElement;
        const cmdLabel = section.querySelector('.mobile-button-command-label') as HTMLElement;
        const direction = section.querySelector('.mobile-button-direction') as HTMLSelectElement;
        const dirLabel = section.querySelector('.mobile-button-direction-label') as HTMLElement;
        const reset = section.querySelector('.mobile-button-color-reset') as HTMLButtonElement | null;

        macro.value = cfg.macro;
        label.value = cfg.label;
        color.value = cfg.color;
        if (command) command.value = cfg.command || '';
        if (direction) direction.value = cfg.direction || '';
        if (preview) {
            preview.textContent = label.value;
            preview.style.backgroundColor = color.value;
        }
        applyLive(id, label.value, color.value);
        const update = () => {
            if (macro.value === 'command') {
                cmdLabel.style.display = '';
            } else {
                cmdLabel.style.display = 'none';
            }
            if (macro.value === 'kierunek') {
                dirLabel.style.display = '';
            } else {
                dirLabel.style.display = 'none';
            }
        };
        macro.addEventListener('change', update);
        if (reset) {
            reset.addEventListener('click', () => {
                color.value = defaultSettings[id].color;
                if (preview) preview.style.backgroundColor = color.value;
                applyLive(id, label.value, color.value);
            });
        }
        label.addEventListener('input', () => {
            if (preview) preview.textContent = label.value;
            applyLive(id, label.value, color.value);
        });
        color.addEventListener('input', () => {
            if (preview) preview.style.backgroundColor = color.value;
            applyLive(id, label.value, color.value);
        });
        update();
    });

    previewButtons.forEach(btn => {
        const id = btn.dataset.buttonId!;
        const config = sections.find(s => s.dataset.buttonId === id);
        if (!config) return;
        btn.addEventListener('click', ev => {
            ev.stopPropagation();
            if (activeConfig === config) {
                hideConfig();
                return;
            }
            hideConfig();
            const rect = btn.getBoundingClientRect();
            const bodyRect = modalBody.getBoundingClientRect();
            config.style.left = rect.left - bodyRect.left + 'px';
            config.style.top = rect.bottom - bodyRect.top + 4 + 'px';
            config.classList.remove('d-none');
            activeConfig = config;
        });
    });

    modalEl.addEventListener('click', (ev) => {
        if (activeConfig && !activeConfig.contains(ev.target as Node)) {
            const isButton = (ev.target as HTMLElement).closest('#mobile-buttons-preview button');
            if (!isButton) hideConfig();
        }
    });

    modalEl.addEventListener('hide.bs.modal', hideConfig);

    const read = (): Record<string, ButtonSetting> => {
        const result: Record<string, ButtonSetting> = {};
        sections.forEach(section => {
            const id = section.dataset.buttonId!;
            const macro = (section.querySelector('.mobile-button-macro') as HTMLSelectElement).value as MacroType;
            const label = (section.querySelector('.mobile-button-label') as HTMLInputElement).value;
            const color = (section.querySelector('.mobile-button-color') as HTMLInputElement).value;
            const command = (section.querySelector('.mobile-button-command') as HTMLTextAreaElement).value;
            const direction = (section.querySelector('.mobile-button-direction') as HTMLSelectElement).value;
            result[id] = { macro, label, color, command, direction };
        });
        return result;
    };

    saveBtn.addEventListener('click', () => {
        current = read();
        saveSettings(current);
        applySettings(current);
        modal.hide();
    });

    button.addEventListener('click', () => {
        modal.show();
    });

    applySettings(current);
}

document.addEventListener('DOMContentLoaded', initMobileButtonSettings);

