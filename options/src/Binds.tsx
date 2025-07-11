import { useEffect, useState } from "react";
import {Form, Button} from 'react-bootstrap';
import storage from "./storage";

interface Bind {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
}

interface BindSettings {
    main: Bind;
    lamp: Bind;
}

const defaultBinds: BindSettings = {
    main: { key: 'BracketRight' },
    lamp: { key: 'Digit4', ctrl: true },
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
            setBinds({
                ...defaultBinds,
                main: res.settings?.binds?.main || defaultBinds.main,
                lamp: res.settings?.binds?.lamp || defaultBinds.lamp,
            });
        });
    }, []);

    function handleCapture(name: keyof BindSettings, ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        ev.preventDefault();
        const { code, ctrlKey, altKey, shiftKey } = ev;
        setBinds(prev => ({ ...prev, [name]: { key: code, ctrl: ctrlKey, alt: altKey, shift: shiftKey } }));
    }

    function save() {
            storage.getItem('settings').then(res => {
                const settings = { ...(res.settings || {}), binds: { main: binds.main, lamp: binds.lamp } };
                storage.setItem('settings', settings).then(() => {
                    if (chrome.runtime) {
                        window.close();
                    } else {
                        window.dispatchEvent(new Event('close-options'));
                    }
            });
        });
    }

    return (
        <div className="m-2 d-flex flex-column gap-3">
            <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="w-32 mb-0">Domyślny</Form.Label>
                <Form.Control
                    type="text"
                    readOnly
                    size="sm"
                    className="w-40"
                    value={label(binds.main)}
                    onKeyDown={ev => handleCapture('main', ev)}
                />
            </Form.Group>
            <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="w-32 mb-0">Napełnij lampę</Form.Label>
                <Form.Control
                    type="text"
                    readOnly
                    size="sm"
                    className="w-40"
                    value={label(binds.lamp)}
                    onKeyDown={ev => handleCapture('lamp', ev)}
                />
            </Form.Group>
            <Button className="mt-2 w-auto" onClick={save}>Zapisz</Button>
        </div>
    );
}

export default Binds;
