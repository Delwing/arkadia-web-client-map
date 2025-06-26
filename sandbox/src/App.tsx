import {Button, Form, InputGroup, Nav} from "react-bootstrap";
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

    const nav = (
        <Nav variant="tabs" activeKey={tab} onSelect={(k) => setTab((k as string) || 'client')} className="ms-2">
            <Nav.Item>
                <Nav.Link eventKey="client">Client</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="tester">Trigger Tester</Nav.Link>
            </Nav.Item>
        </Nav>
    )

    return (
        <>
            {createPortal(nav, document.getElementById('controls')!)}
            <Controls/>
            {tab === 'client' && (
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    send()
                }}>
                    <InputGroup className="mb-3 mt-3">
                        <Form.Control ref={input} value={text} onKeyDown={handleKeyDown} onKeyUp={handleKeys}
                                      onChange={event => setText(event.currentTarget.value)}></Form.Control>
                        <Button variant={'secondary'} onClick={send}>Wyślij</Button>
                    </InputGroup>
                </Form>
            )}
            {tab === 'tester' && createPortal(<TriggerTester/>, document.getElementById('tester-container')!)}
        </>
    )
}
