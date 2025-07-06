import './App.css'
import {useState} from "react";
import {Tabs, Tab} from 'react-bootstrap';
import SettingsForm from "./Settings.tsx";
import Npc from "./Npc.tsx";
import SettingsFile from "./SettingsFile";
import Binds from "./Binds";


function App() {
    const [tab, setTab] = useState<'settings' | 'npc' | 'file' | 'binds'>('settings')

    return (
        <div className="p-2">
            <Tabs activeKey={tab} onSelect={(k) => k && setTab(k as any)} className="mb-2">
                <Tab eventKey="settings" title="Ustawienia">
                    <SettingsForm />
                </Tab>
                <Tab eventKey="npc" title="Odbiorcy paczek">
                    <Npc />
                </Tab>
                <Tab eventKey="file" title="Plik ustawień">
                    <SettingsFile />
                </Tab>
                <Tab eventKey="binds" title="Bindowanie">
                    <Binds />
                </Tab>
            </Tabs>
        </div>
    )
}

export default App
