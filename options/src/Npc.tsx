import './App.css'
import {Button, Container, Table} from "react-bootstrap";
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
            <Container className={'m-2'}>
                <Button size={'sm'} className={'mb-2 me-2'} onClick={() => downloadNpcs()}>Pobierz bazę</Button>
                <Button size={'sm'} className={'mb-2'} onClick={() => clearNpcs()}>Wyczyść bazę</Button>
                <Table striped bordered hover>
                    <tbody>
                    {npcs.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                        <tr key={item.name + '-' + item.loc}>
                            <td>{item.name}</td>
                            <td>{item.loc}</td>
                        </tr>))}
                    </tbody>
                </Table>
            </Container>
        </>
    )
}

export default Npc
