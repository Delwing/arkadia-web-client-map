import {Button, Form, InputGroup} from "react-bootstrap";
import {createRef, useState} from "react";
import {Controls} from "./Controls.tsx";
import TriggerTester from "./TriggerTester.tsx";
import type {KeyboardEvent} from 'react';


export default function App() {

    const [text, setText] = useState('')
    const input = createRef<HTMLInputElement>();

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
            <Form onSubmit={(e) => {
                e.preventDefault();
                send()
            }}>
                <InputGroup className="mt-3">
                    <Form.Control ref={input} value={text} onKeyDown={handleKeyDown} onKeyUp={handleKeys}
                                  onChange={event => setText(event.currentTarget.value)}></Form.Control>
                    <Button variant={'secondary'} onClick={send}>Wyślij</Button>
                </InputGroup>
            </Form>
            <TriggerTester/>
        </>
    )
}
