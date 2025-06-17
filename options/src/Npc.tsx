import './App.css'
import {Container} from "react-bootstrap";
import {useEffect, useState} from "react";
import storage from "./storage.ts";

interface NpcProps {
    name: string;
    loc: number
}

function Npc() {

    const [npcs, setNpcs] = useState<NpcProps[]>([])

    useEffect(() => {
        storage.downloadItem('https://delwing.github.io/arkadia-mapa/data/npc.json', 60 * 60 * 24).then(value => {
            setNpcs(value.value)
        })
    }, []);

    return (
        <>
            <Container className={'m-2'}>
                <table>
                    <tbody>
                    {npcs.map((item) => (<tr key={item.name + '-' + item.loc}>
                        <td>{item.name}</td>
                        <td>{item.loc}</td>
                    </tr>))}
                    </tbody>
                </table>
            </Container>
        </>
    )
}

export default Npc
