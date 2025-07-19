import Modal from "bootstrap/js/dist/modal";

export type MacroType = 'functional' | 'zList' | 'zaList' | 'command';

export interface ButtonSetting {
    macro: MacroType;
    label: string;
    color: string;
    command?: string;
}

const defaultSettings: Record<string, ButtonSetting> = {
    'bracket-right-button': { macro: 'functional', label: ']', color: '#87CEEB' },
    'button-1': { macro: 'command', label: 'wesprzyj', color: '#87CEEB', command: 'wesprzyj' },
    'button-2': { macro: 'command', label: '/z cel', color: '#87CEEB', command: '/z cel' },
    'button-3': { macro: 'command', label: '/zas cel', color: '#87CEEB', command: '/zas cel' },
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

    let current = loadSettings();
    sections.forEach(section => {
        const id = section.dataset.buttonId!;
        const cfg = current[id] || defaultSettings[id];
        const macro = section.querySelector('.mobile-button-macro') as HTMLSelectElement;
        const label = section.querySelector('.mobile-button-label') as HTMLInputElement;
        const color = section.querySelector('.mobile-button-color') as HTMLInputElement;
        const command = section.querySelector('.mobile-button-command') as HTMLTextAreaElement;
        const cmdLabel = section.querySelector('.mobile-button-command-label') as HTMLElement;

        macro.value = cfg.macro;
        label.value = cfg.label;
        color.value = cfg.color;
        if (command) command.value = cfg.command || '';
        const update = () => {
            if (macro.value === 'command') {
                cmdLabel.style.display = '';
            } else {
                cmdLabel.style.display = 'none';
            }
        };
        macro.addEventListener('change', update);
        update();
    });

    const read = (): Record<string, ButtonSetting> => {
        const result: Record<string, ButtonSetting> = {};
        sections.forEach(section => {
            const id = section.dataset.buttonId!;
            const macro = (section.querySelector('.mobile-button-macro') as HTMLSelectElement).value as MacroType;
            const label = (section.querySelector('.mobile-button-label') as HTMLInputElement).value;
            const color = (section.querySelector('.mobile-button-color') as HTMLInputElement).value;
            const command = (section.querySelector('.mobile-button-command') as HTMLTextAreaElement).value;
            result[id] = { macro, label, color, command };
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

