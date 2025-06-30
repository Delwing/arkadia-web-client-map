import './App.css'
import {ChangeEvent, useEffect, useState} from "react";
import storage from "./storage.ts";

interface NpcProps {
    name: string;
    loc: number
}

function Npc() {

    const [npcs, setNpcs] = useState<NpcProps[]>([])
    const [filter, setFilter] = useState<string>('')

    useEffect(() => {
        storage.getItem('npc').then((value: { npc: NpcProps[] }) => {
            if (value && value.npc) {
                setNpcs(value.npc)
            }
        })
    }, []);

    function downloadNpcs() {
        storage.downloadItem('https://delwing.github.io/arkadia-mapa/data/npc.json', 60 * 60 * 24).then(value => {
            setNpcs(value.value)
            storage.setItem('npc', value.value)
        })
    }

    function clearNpcs() {
        setNpcs([])
        storage.setItem('npc', [])
    }

    function deleteNpc(npc: NpcProps) {
        const updated = npcs.filter(n => !(n.name === npc.name && n.loc === npc.loc))
        setNpcs(updated)
        storage.setItem('npc', updated)
    }

    return (
        <>
            <div className={'m-2'}>
                <div className="mb-2 flex items-center gap-2">
                    <button className={'btn btn-primary btn-sm'} onClick={() => downloadNpcs()}>Pobierz bazę</button>
                    <button className={'btn btn-error btn-sm'} onClick={() => clearNpcs()}>Wyczyść bazę</button>
                    <input
                        type="text"
                        placeholder="Filtruj"
                        className="input input-sm input-bordered"
                        value={filter}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                    />
                </div>
                <table className="min-w-full border border-gray-700 text-sm table-zebra">
                    <tbody>
                    {npcs
                        .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                            <tr key={item.name + '-' + item.loc}>
                                <td className="px-2 py-1 border border-gray-700">{item.name}</td>
                                <td className="px-2 py-1 border border-gray-700">{item.loc}</td>
                                <td className="px-2 py-1 border border-gray-700">
                                    <button className="btn btn-error btn-xs" onClick={() => deleteNpc(item)}>
                                        usuń
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Npc
