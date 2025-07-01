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
    collectMode: number;
    collectMoneyType: number;
    collectExtra: string[];
}

function SettingsForm() {

    const [settings, setSettings] = useState<Settings>({
        guilds: [],
        packageHelper: false,
        replaceMap: false,
        inlineCompassRose: false,
        prettyContainers: true,
        containerColumns: 2,
        collectMode: 3,
        collectMoneyType: 1,
        collectExtra: [],
    })

    const allSelected = settings.guilds.length === guilds.length
    const [extraInput, setExtraInput] = useState<string>('')

    function onChangeSetting(modifier: (settings: Settings) => void) {
        setSettings(prev => {
            const updated = {...prev}
            modifier(updated)
            return updated
        })
    }

    function onChange(event: ChangeEvent<HTMLInputElement>, guild: string) {
        setSettings(prev => {
            const guilds = event.target.checked
                ? [...prev.guilds, guild]
                : prev.guilds.filter(g => g !== guild)
            return {...prev, guilds}
        })
    }

    function onChangeAll(event: ChangeEvent<HTMLInputElement>) {
        setSettings(prev => ({
            ...prev,
            guilds: event.target.checked ? [...guilds] : []
        }))
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
                <div className="mb-4 border border-secondary rounded-box p-3 bg-neutral/10">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold">Ładowanie triggerów dla gildii</h5>
                        <label className="flex items-center gap-1" key="all-guilds">
                            <input
                                type="checkbox"
                                id="guild-all"
                                name="guild-all"
                                onChange={event => onChangeAll(event)}
                                className="checkbox checkbox-sm mx-1"
                                checked={allSelected}
                            />
                            Wszystkie
                        </label>
                    </div>
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
                <div className="mb-4 border border-secondary rounded-box p-3 bg-neutral/10">
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
                <div className="mb-4 border border-secondary rounded-box p-3 bg-neutral/10">
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
                <div className="mb-4 border border-secondary rounded-box p-3 bg-neutral/10">
                    <h5 className="font-bold mb-2">Zbieranie przedmiotów</h5>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-1">
                            <span className="mr-1">Tryb zbierania:</span>
                            <select
                                className="select select-sm"
                                value={settings.collectMode}
                                onChange={e => onChangeSetting(s => s.collectMode = parseInt(e.target.value))}
                            >
                                {Array.from({length: 7}, (_, i) => i + 1).map(i => (
                                    <option value={i} key={i}>{i}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-1">
                            <span className="mr-1">Rodzaj monet:</span>
                            <select
                                className="select select-sm"
                                value={settings.collectMoneyType}
                                onChange={e => onChangeSetting(s => s.collectMoneyType = parseInt(e.target.value))}
                            >
                                {Array.from({length: 3}, (_, i) => i + 1).map(i => (
                                    <option value={i} key={i}>{i}</option>
                                ))}
                            </select>
                        </label>
                        <div>
                            <span className="mr-1">Dodatkowe przedmioty:</span>
                            <input
                                id="extraItem"
                                type="text"
                                className="input input-bordered input-sm mr-1 w-40"
                                value={extraInput}
                                onChange={e => setExtraInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (extraInput.trim()) {
                                            onChangeSetting(s => s.collectExtra = [...s.collectExtra, extraInput.trim()]);
                                            setExtraInput('');
                                        }
                                    }
                                }}
                            />
                            <button
                                className="btn btn-sm"
                                onClick={() => {
                                    if (extraInput.trim()) {
                                        onChangeSetting(s => s.collectExtra = [...s.collectExtra, extraInput.trim()]);
                                        setExtraInput('');
                                    }
                                }}
                            >
                                Dodaj
                            </button>
                        </div>
                        <ul className="list-disc pl-5">
                            {settings.collectExtra.map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <span>{item}</span>
                                    <button className="btn btn-xs" onClick={() => onChangeSetting(s => s.collectExtra = s.collectExtra.filter(i => i !== item))}>Usuń</button>
                                </li>
                            ))}
                        </ul>
                        {settings.collectExtra.length > 0 && (
                            <button className="btn btn-xs mt-1" onClick={() => onChangeSetting(s => s.collectExtra = [])}>Wyczyść wszystko</button>
                        )}
                    </div>
                </div>
                <button className="btn btn-primary mt-2" onClick={() => handleSubmission()}>Zapisz</button>
            </div>
        </>
    )
}

export default SettingsForm
