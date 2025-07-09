import './App.css'
import {ChangeEvent, useEffect, useState} from "react";
import {Form, Button} from 'react-bootstrap';
import storage from "./storage.ts";

const guilds = [
    "CKN", "ES", "SC", "KS", "KM", "OS",
    "OHM", "SGW", "PE", "WKS", "LE", "KG",
    "KGKS", "MC", "OK", "RA", "GL", "ZT",
    "ZS", "ZH", "GP", "NPC"
]

const collectModeOptions = [
    "monety",
    "kamienie",
    "monety i kamienie",
    "druzynowe monety",
    "druzynowe kamienie",
    "druzynowe monety i kamienie",
    "nic",
]

const collectMoneyOptions = ["wszystkie", "srebrne", "zlote"]

interface Settings {
    guilds: string[];
    enemyGuilds: string[];
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
        enemyGuilds: [],
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
    const allEnemySelected = settings.enemyGuilds.length === guilds.length
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

    function onChangeEnemy(event: ChangeEvent<HTMLInputElement>, guild: string) {
        setSettings(prev => {
            const enemyGuilds = event.target.checked
                ? [...prev.enemyGuilds, guild]
                : prev.enemyGuilds.filter(g => g !== guild)
            return {...prev, enemyGuilds}
        })
    }

    function onChangeAllEnemy(event: ChangeEvent<HTMLInputElement>) {
        setSettings(prev => ({
            ...prev,
            enemyGuilds: event.target.checked ? [...guilds] : []
        }))
    }

    function handleSubmission() {
        storage.setItem("settings", settings)
        if (chrome.runtime) {
            window.close()
        } else {
            window.dispatchEvent(new Event('close-options'))
        }
    }

    useEffect(() => {
        storage.getItem("settings").then(res => {
            setSettings(Object.assign({}, settings, res.settings));
        })
    }, []);

    return (
        <div className="my-4 p-2">
            <div className="mb-4 border rounded p-3">
                <div className="d-flex justify-content-between mb-2">
                    <h5 className="fw-bold">Ładowanie triggerów dla gildii</h5>
                    <Form.Check
                        type="checkbox"
                        id="guild-all"
                        label="Wszystkie"
                        checked={allSelected}
                        onChange={onChangeAll}
                    />
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {guilds.map(guild => (
                        <Form.Check
                            type="checkbox"
                            key={guild}
                            id={`guild-${guild}`}
                            label={guild}
                            checked={settings.guilds.includes(guild)}
                            onChange={ev => onChange(ev, guild)}
                            className="me-2"
                        />
                    ))}
                </div>
            </div>
            <div className="mb-4 border rounded p-3">
                <div className="d-flex justify-content-between mb-2">
                    <h5 className="fw-bold">Gildie wrogów (alarm ataku)</h5>
                    <Form.Check
                        type="checkbox"
                        id="enemy-guild-all"
                        label="Wszystkie"
                        checked={allEnemySelected}
                        onChange={onChangeAllEnemy}
                    />
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {guilds.map(guild => (
                        <Form.Check
                            type="checkbox"
                            key={`enemy-${guild}`}
                            id={`enemy-guild-${guild}`}
                            label={guild}
                            checked={settings.enemyGuilds.includes(guild)}
                            onChange={ev => onChangeEnemy(ev, guild)}
                            className="me-2"
                        />
                    ))}
                </div>
            </div>
            <div className="mb-4 border rounded p-3">
                <h5 className="fw-bold mb-2">Pozostałe opcje</h5>
                <div className="d-flex flex-wrap gap-3">
                    <Form.Check
                        type="checkbox"
                        id="replaceMap"
                        label="Zamień wbudowaną mapę"
                        checked={settings.replaceMap}
                        onChange={e => onChangeSetting(s => s.replaceMap = e.target.checked)}
                        className="me-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="packageHelper"
                        label="Asystent paczek"
                        checked={settings.packageHelper}
                        onChange={e => onChangeSetting(s => s.packageHelper = e.target.checked)}
                        className="me-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="inlineCompassRose"
                        label="Róża wiatrów"
                        checked={settings.inlineCompassRose}
                        onChange={e => onChangeSetting(s => s.inlineCompassRose = e.target.checked)}
                        className="me-2"
                    />
                </div>
            </div>
            <div className="mb-4 border rounded p-3">
                <h5 className="fw-bold mb-2">Pojemniki</h5>
                <div className="d-flex flex-wrap gap-3">
                    <Form.Check
                        type="checkbox"
                        id="prettyContainers"
                        label="Formatuj pojemniki"
                        checked={settings.prettyContainers}
                        onChange={e => onChangeSetting(s => s.prettyContainers = e.target.checked)}
                        className="me-2"
                    />
                    <Form.Group className="d-flex align-items-center me-2">
                        <Form.Label className="me-1 mb-0">Kolumny:</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            max={4}
                            id="containerColumns"
                            value={settings.containerColumns}
                            onChange={ev => onChangeSetting(s => s.containerColumns = parseInt(ev.target.value) || 1)}
                            style={{width: '100%', maxWidth: '4rem'}}
                        />
                    </Form.Group>
                </div>
            </div>
            <div className="mb-4 border rounded p-3">
                <h5 className="fw-bold mb-2">Zbieranie przedmiotów</h5>
                <div className="d-flex flex-column gap-2">
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-1 mb-0">Tryb zbierania:</Form.Label>
                        <Form.Select
                            size="sm"
                            value={settings.collectMode}
                            onChange={e => onChangeSetting(s => s.collectMode = parseInt(e.target.value))}
                            className="w-auto"
                        >
                            {collectModeOptions.map((label, i) => (
                                <option value={i + 1} key={i + 1}>{`${i + 1} - ${label}`}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-1 mb-0">Rodzaj monet:</Form.Label>
                        <Form.Select
                            size="sm"
                            value={settings.collectMoneyType}
                            onChange={e => onChangeSetting(s => s.collectMoneyType = parseInt(e.target.value))}
                            className="w-auto"
                        >
                            {collectMoneyOptions.map((label, i) => (
                                <option value={i + 1} key={i + 1}>{`${i + 1} - ${label}`}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="me-1">Dodatkowe przedmioty:</Form.Label>
                        <Form.Control
                            id="extraItem"
                            type="text"
                            size="sm"
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
                            className="d-inline-block me-1 w-auto"
                            style={{width: '100%', maxWidth: '10rem'}}
                        />
                        <Button
                            size="sm"
                            onClick={() => {
                                if (extraInput.trim()) {
                                    onChangeSetting(s => s.collectExtra = [...s.collectExtra, extraInput.trim()]);
                                    setExtraInput('');
                                }
                            }}
                        >
                            Dodaj
                        </Button>
                    </Form.Group>
                    <ul className="list-unstyled ms-3">
                        {settings.collectExtra.map(item => (
                            <li key={item} className="d-flex align-items-center gap-2">
                                <span>{item}</span>
                                <Button size="sm" variant="secondary" onClick={() => onChangeSetting(s => s.collectExtra = s.collectExtra.filter(i => i !== item))}>Usuń</Button>
                            </li>
                        ))}
                    </ul>
                    {settings.collectExtra.length > 0 && (
                        <Button size="sm" variant="secondary" className="mt-1" onClick={() => onChangeSetting(s => s.collectExtra = [])}>Wyczyść wszystko</Button>
                    )}
                </div>
            </div>
            <Button onClick={handleSubmission}>Zapisz</Button>
        </div>
    )
}

export default SettingsForm
