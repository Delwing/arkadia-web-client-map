import './App.css'
import {useState} from "react";
import SettingsForm from "./Settings.tsx";
import Npc from "./Npc.tsx";


function App() {
    const [tab, setTab] = useState<'settings' | 'npc'>('settings')

    return (
        <div className="p-2">
            <div className="mb-2 border-b flex">
                <button
                    className={`px-4 py-2 font-medium ${tab === 'settings' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('settings')}
                >
                    Ustawienia
                </button>
                <button
                    className={`px-4 py-2 font-medium ${tab === 'npc' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('npc')}
                >
                    Odbiorcy paczek
                </button>
            </div>
            {tab === 'settings' && <SettingsForm />}
            {tab === 'npc' && <Npc />}
        </div>
    )
}

export default App
