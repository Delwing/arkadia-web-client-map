import { useEffect, useState, KeyboardEvent } from "react";
import storage from "./storage";

interface Bind {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
}

interface BindSettings {
    main: Bind;
    gates: Bind;
    collector: Bind;
}

const defaultBinds: BindSettings = {
    main: { key: 'BracketRight' },
    gates: { key: 'Digit2', ctrl: true },
    collector: { key: 'Digit3', ctrl: true },
};

function label(bind: Bind) {
    let key = bind.key;
    if (key.startsWith('Digit')) key = key.substring(5);
    else if (key.startsWith('Key')) key = key.substring(3);
    else if (key === 'BracketRight') key = ']';
    else if (key === 'BracketLeft') key = '[';
    const parts: string[] = [];
    if (bind.ctrl) parts.push('CTRL');
    if (bind.alt) parts.push('ALT');
    if (bind.shift) parts.push('SHIFT');
    parts.push(key);
    return parts.join('+');
}

function Binds() {
    const [binds, setBinds] = useState<BindSettings>(defaultBinds);

    useEffect(() => {
        storage.getItem('settings').then(res => {
            setBinds({ ...defaultBinds, ...(res.settings?.binds || {}) });
        });
    }, []);

    function handleCapture(name: keyof BindSettings, ev: KeyboardEvent<HTMLInputElement>) {
        ev.preventDefault();
        const { code, ctrlKey, altKey, shiftKey } = ev;
        setBinds(prev => ({ ...prev, [name]: { key: code, ctrl: ctrlKey, alt: altKey, shift: shiftKey } }));
    }

    function save() {
        storage.getItem('settings').then(res => {
            const settings = { ...(res.settings || {}), binds };
            storage.setItem('settings', settings).then(() => {
                if (chrome.runtime) {
                    window.close();
                }
            });
        });
    }

    return (
        <div className="m-2 flex flex-col gap-3">
            <label className="flex items-center gap-2">
                <span className="w-32">Domyślny</span>
                <input
                    type="text"
                    readOnly
                    className="input input-bordered input-sm w-40"
                    value={label(binds.main)}
                    onKeyDown={ev => handleCapture('main', ev)}
                />
            </label>
            <label className="flex items-center gap-2">
                <span className="w-32">Wrota</span>
                <input
                    type="text"
                    readOnly
                    className="input input-bordered input-sm w-40"
                    value={label(binds.gates)}
                    onKeyDown={ev => handleCapture('gates', ev)}
                />
            </label>
            <label className="flex items-center gap-2">
                <span className="w-32">Zbieranie</span>
                <input
                    type="text"
                    readOnly
                    className="input input-bordered input-sm w-40"
                    value={label(binds.collector)}
                    onKeyDown={ev => handleCapture('collector', ev)}
                />
            </label>
            <button className="btn btn-primary mt-2 w-auto self-start" onClick={save}>Zapisz</button>
        </div>
    );
}

export default Binds;
