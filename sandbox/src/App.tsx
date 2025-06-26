import {Button, Form, InputGroup, Tab, Tabs} from "react-bootstrap";
import {createPortal} from "react-dom";
import {createRef, useEffect, useState} from "react";
import {Controls} from "./Controls.tsx";
import TriggerTester from "./TriggerTester.tsx";
import type {KeyboardEvent} from 'react';


export default function App() {

    const [text, setText] = useState('')
    const [tab, setTab] = useState('client')
    const input = createRef<HTMLInputElement>();

    useEffect(() => {
        const main = document.getElementById('main-container')
        const tester = document.getElementById('tester-container')
        const bottom = document.getElementById('panel_buttons_bottom')
        if (main) main.style.display = tab === 'client' ? 'flex' : 'none'
        if (tester) tester.style.display = tab === 'tester' ? 'block' : 'none'
        if (bottom) bottom.style.display = tab === 'client' ? '' : 'none'
    }, [tab])

    function send() {
        //window.clientExtension.fake(text)
        window.Input.send(text.trim())
        input?.current?.select()
    }


    function handleKeys(ev: KeyboardEvent) {
        if (ev.code === '13' && !ev.shiftKey) {
            ev.preventDefault()
            send()
        }
    }


    function handleKeyDown(ev: KeyboardEvent) {
        if (ev.code === '13' && !ev.shiftKey) {
            ev.preventDefault()
        }
    }

    return (
        <>
            <Controls/>
            <Tabs activeKey={tab} onSelect={(k) => setTab(k || 'client')} className="mt-3">
                <Tab eventKey="client" title="Client" className="pt-3">
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        send()
                    }}>
                        <InputGroup className="mb-3">
                            <Form.Control ref={input} value={text} onKeyDown={handleKeyDown} onKeyUp={handleKeys}
                                          onChange={event => setText(event.currentTarget.value)}></Form.Control>
                            <Button variant={'secondary'} onClick={send}>Wyślij</Button>
                        </InputGroup>
                    </Form>
                </Tab>
                <Tab eventKey="tester" title="Trigger Tester" className="pt-3" />
            </Tabs>
            {tab === 'tester' && createPortal(<TriggerTester/>, document.getElementById('tester-container')!)}
        </>
    )
}
