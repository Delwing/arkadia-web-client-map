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
    inlineCompassRose: boolean;
    prettyContainers: boolean;
    containerColumns: number;
}

function SettingsForm() {

    const [settings, setSettings] = useState<Settings>({
        guilds: [],
        packageHelper: false,
        replaceMap: false,
        inlineCompassRose: false,
        prettyContainers: true,
        containerColumns: 2,
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
                <div className="mb-4 border border-info/40 rounded-box p-3 bg-neutral/10">
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
                                    className="checkbox checkbox-sm mx-1"
                                    checked={settings.guilds.indexOf(guild) != -1}
                                />
                                {guild}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-4 border border-info/40 rounded-box p-3 bg-neutral/10">
                    <h5 className="font-bold mb-2">Pozostałe opcje</h5>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="replaceMap"
                                name="replaceMap"
                                onChange={event => onChangeSetting((s) => s.replaceMap = event.target.checked)}
                                className="mx-1 checkbox checkbox-sm"
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
                                className="mx-1 checkbox checkbox-sm"
                                checked={settings.packageHelper}
                            />
                            Asystent paczek
                        </label>
                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="inlineCompassRose"
                                name="inlineCompassRose"
                                onChange={event => onChangeSetting((s) => s.inlineCompassRose = event.target.checked)}
                                className="mx-1 checkbox checkbox-sm"
                                checked={settings.inlineCompassRose}
                            />
                            Róża wiatrów
                        </label>
                    </div>
                </div>
                <div className="mb-4 border border-info/40 rounded-box p-3 bg-neutral/10">
                    <h5 className="font-bold mb-2">Pojemniki</h5>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="prettyContainers"
                                name="prettyContainers"
                                onChange={event => onChangeSetting((s) => s.prettyContainers = event.target.checked)}
                                className="mx-1 checkbox checkbox-sm"
                                checked={settings.prettyContainers}
                            />
                            Formatuj pojemniki
                        </label>
                        <label className="flex items-center gap-1">
                            <span className="mr-1">Kolumny:</span>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                id="containerColumns"
                                name="containerColumns"
                                onChange={event => onChangeSetting((s) => s.containerColumns = parseInt(event.target.value) || 1)}
                                className="mx-1 input input-bordered input-sm w-16"
                                value={settings.containerColumns}
                            />
                        </label>
                    </div>
                </div>
                <button className="btn btn-soft btn-primary mt-2" onClick={() => handleSubmission()}>Zapisz</button>
            </div>
        </>
    )
}

export default SettingsForm
