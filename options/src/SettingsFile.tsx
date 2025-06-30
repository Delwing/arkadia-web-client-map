import {ChangeEvent, useRef, useState} from "react";
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
        <div className="m-2 flex flex-col gap-2">
            <button className="btn btn-primary btn-sm w-40" onClick={downloadSettings}>
                Pobierz ustawienia
            </button>
            <label className="btn btn-primary btn-sm w-40" htmlFor="settingsFile">
                Wczytaj ustawienia
            </label>
            <input
                id="settingsFile"
                ref={fileInput}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={uploadSettings}
            />
            {message && (
                <div>
                    <div>{message}</div>
                    {details.length > 0 && (
                        <ul className="list-disc pl-4 text-sm">
                            {details.map(line => <li key={line}>{line}</li>)}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SettingsFile;
