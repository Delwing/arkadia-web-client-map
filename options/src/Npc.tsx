import './App.css'
import {ChangeEvent, useEffect, useState} from "react";
import {Button, Form, Table} from 'react-bootstrap';
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
        <div className="m-2">
            <div className="mb-2 d-flex align-items-center gap-2">
                <Button variant="primary" size="sm" onClick={downloadNpcs}>Pobierz bazę</Button>
                <Button variant="danger" size="sm" onClick={clearNpcs}>Wyczyść bazę</Button>
                <Form.Control
                    type="text"
                    placeholder="Filtruj"
                    size="sm"
                    value={filter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                    style={{width: '160px'}}
                />
            </div>
            <Table bordered size="sm" className="table-zebra">
                <tbody className="align-middle">
                {npcs
                    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                        <tr key={item.name + '-' + item.loc}>
                            <td>{item.name}</td>
                            <td>{item.loc}</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => deleteNpc(item)}>usuń</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}

export default Npc
