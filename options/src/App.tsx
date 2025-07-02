import './App.css'
import {useState} from "react";
import SettingsForm from "./Settings.tsx";
import Npc from "./Npc.tsx";
import SettingsFile from "./SettingsFile";
import Binds from "./Binds";


function App() {
    const [tab, setTab] = useState<'settings' | 'npc' | 'file' | 'binds'>('settings')

    return (
        <div className="p-2">
            <div className="mb-2 border-b flex">
                <button
                    className={`cursor-pointer px-4 py-2 font-medium ${tab === 'settings' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('settings')}
                >
                    Ustawienia
                </button>
                <button
                    className={`cursor-pointer px-4 py-2 font-medium ${tab === 'npc' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('npc')}
                >
                    Odbiorcy paczek
                </button>
                <button
                    className={`cursor-pointer px-4 py-2 font-medium ${tab === 'file' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('file')}
                >
                    Plik ustawień
                </button>
                <button
                    className={`cursor-pointer px-4 py-2 font-medium ${tab === 'binds' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setTab('binds')}
                >
                    Bindowanie
                </button>
            </div>
            {tab === 'settings' && <SettingsForm />}
            {tab === 'npc' && <Npc />}
            {tab === 'file' && <SettingsFile />}
            {tab === 'binds' && <Binds />}
        </div>
    )
}

export default App
