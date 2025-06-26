import './App.css'
import {useEffect, useState} from "react";
import storage from "./storage.ts";

interface NpcProps {
    name: string;
    loc: number
}

function Npc() {

    const [npcs, setNpcs] = useState<NpcProps[]>([])

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

    return (
        <>
            <div className={'m-2'}>
                <button className={'btn btn-primary btn-sm mb-2 mr-2'} onClick={() => downloadNpcs()}>Pobierz bazę</button>
                <button className={'btn btn-error btn-sm mb-2'} onClick={() => clearNpcs()}>Wyczyść bazę</button>
                <table className="min-w-full border border-gray-700 text-sm">
                    <tbody>
                    {npcs.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                        <tr key={item.name + '-' + item.loc} className="odd:bg-gray-800 even:bg-gray-700">
                            <td className="px-2 py-1 border border-gray-700">{item.name}</td>
                            <td className="px-2 py-1 border border-gray-700">{item.loc}</td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Npc
