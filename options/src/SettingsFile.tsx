import {ChangeEvent, useState} from "react";
import storage from "./storage";

function SettingsFile() {
    const [message, setMessage] = useState<string>('');

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
            setMessage('Ustawienia wczytane');
        } catch (e) {
            setMessage('Błędny plik');
        }
    }

    return (
        <div className="m-2 flex flex-col gap-2">
            <button className="btn btn-primary btn-sm w-40" onClick={downloadSettings}>
                Pobierz ustawienia
            </button>
            <input type="file" accept="application/json" onChange={uploadSettings} />
            {message && <div>{message}</div>}
        </div>
    );
}

export default SettingsFile;
