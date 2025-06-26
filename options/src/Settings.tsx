import './App.css'
import {ChangeEvent, useEffect, useState} from "react";
import storage from "./storage.ts";

const guilds = [
    "CKN", "ES", "SC", "KS", "KM", "OS",
    "OHM", "SGW", "PE", "WKS", "LE", "KG",
    "KGKS", "MC", "OK", "RA", "GL", "ZT",
    "ZS", "ZH", "GP", "NPC"
]

interface Settings {
    guilds: string[];
    packageHelper: boolean;
    replaceMap: boolean;
}

function SettingsForm() {

    const [settings, setSettings] = useState<Settings>({
        guilds: [],
        packageHelper: false,
        replaceMap: false
    })

    function onChangeSetting(modifier: (settings: Settings) => void) {
        modifier(settings)
        setSettings(Object.assign({}, settings))
    }

    function onChange(event: ChangeEvent<HTMLInputElement>, guild: string) {
        if (event.target.checked) {
            settings.guilds.push(guild)
        } else {
            settings.guilds.splice(settings.guilds.indexOf(guild), 1)
        }
        setSettings(Object.assign({}, settings))
    }

    function handleSubmission() {
        storage.setItem("settings", settings)
        if (chrome.runtime) {
            window.close()
        }
    }

    useEffect(() => {
        storage.getItem("settings").then(res => {
            setSettings(Object.assign({}, settings, res.settings));
        })
    }, []);


    return (
        <>
            <div className="my-4 p-2">
                <div className="mb-4 border rounded p-2">
                    <h5 className="font-bold mb-2">Ładowanie triggerów dla gildii</h5>
                    <div className="flex flex-wrap gap-2">
                        {guilds.map(guild => (
                            <label className="flex items-center gap-1 w-20" key={guild}>
                                <input
                                    type="checkbox"
                                    id={`guild-${guild}`}
                                    name="guild"
                                    value={guild}
                                    onChange={event => onChange(event, guild)}
                                    className="mx-1"
                                    checked={settings.guilds.indexOf(guild) != -1}
                                />
                                {guild}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-4 border rounded p-2">
                    <h5 className="font-bold mb-2">Pozostałe opcje</h5>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="replaceMap"
                                name="replaceMap"
                                onChange={event => onChangeSetting((s) => s.replaceMap = event.target.checked)}
                                className="mx-1"
                                checked={settings.replaceMap}
                            />
                            Zamień wbudowaną mapę
                        </label>
                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="packageHelper"
                                name="packageHelper"
                                onChange={event => onChangeSetting((s) => s.packageHelper = event.target.checked)}
                                className="mx-1"
                                checked={settings.packageHelper}
                            />
                            Asystent paczek
                        </label>
                    </div>
                </div>
                <button className="btn btn-primary mt-2" onClick={() => handleSubmission()}>Zapisz</button>
            </div>
        </>
    )
}

export default SettingsForm
