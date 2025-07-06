import {ChangeEvent, useRef, useState} from "react";
import {Button, Form} from 'react-bootstrap';
import storage from "./storage";

function SettingsFile() {
    const [message, setMessage] = useState<string>('');
    const [details, setDetails] = useState<string[]>([]);
    const fileInput = useRef<HTMLInputElement>(null);

    async function downloadSettings() {
        const data = await storage.getItem('settings');
        const json = JSON.stringify(data?.settings ?? {}, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arkadia-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async function uploadSettings(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await storage.setItem('settings', data);
            const entries = Object.entries(data).map(([k, v]) => `${k}: ${v}`);
            entries.forEach(line => console.log(line));
            setDetails(entries);
            setMessage('Ustawienia wczytane');
        } catch (e) {
            setDetails([]);
            setMessage('Błędny plik');
        }
    }

    return (
        <div className="m-2 d-flex flex-column gap-2">
            <Button variant="primary" size="sm" className="w-40" onClick={downloadSettings}>
                Pobierz ustawienia
            </Button>
            <Form.Label as={Button} variant="primary" size="sm" className="w-40" htmlFor="settingsFile">
                Wczytaj ustawienia
            </Form.Label>
            <Form.Control
                id="settingsFile"
                ref={fileInput}
                type="file"
                accept="application/json"
                className="d-none"
                onChange={uploadSettings}
            />
            {message && (
                <div>
                    <div>{message}</div>
                    {details.length > 0 && (
                        <ul className="list-unstyled ms-3 small">
                            {details.map(line => <li key={line}>{line}</li>)}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SettingsFile;
