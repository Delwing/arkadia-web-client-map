import './App.css'
import {Tab, Tabs} from "react-bootstrap";
import SettingsForm from "./Settings.tsx";
import Npc from "./Npc.tsx";


function App() {
    return (
        <>
           <Tabs defaultActiveKey={'settings'} fill>
               <Tab title={'Ustawienia'} eventKey={'settings'}>
                   <SettingsForm />
               </Tab>
               <Tab title={'Odbiorcy paczek'} eventKey={'npc'}>
                   <Npc />
               </Tab>
           </Tabs>
        </>
    )
}

export default App
