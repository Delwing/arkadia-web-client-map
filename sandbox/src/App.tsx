import {Button, Form, InputGroup} from "react-bootstrap";
import {createRef, useState} from "react";
import {Controls} from "./Controls.tsx";
import type {KeyboardEvent} from 'react';


export default function App() {

    const [text, setText] = useState('')
    const [history, setHistory] = useState<string[]>([])
    const [historyPos, setHistoryPos] = useState(-1)
    const input = createRef<HTMLInputElement>();

    function send() {
        const command = text.trim()
        //window.clientExtension.fake(text)
        if (command) {
            setHistory(h => [...h, command])
            setHistoryPos(-1)
        }
        window.Input.send(command)
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
        } else if (ev.code === 'ArrowUp') {
            ev.preventDefault()
            setHistoryPos(pos => {
                const newPos = pos === -1 ? history.length - 1 : Math.max(pos - 1, 0)
                if (history[newPos] !== undefined) {
                    setText(history[newPos])
                }
                return newPos
            })
        } else if (ev.code === 'ArrowDown') {
            ev.preventDefault()
            setHistoryPos(pos => {
                if (pos === -1) return -1
                const newPos = pos + 1
                if (newPos >= history.length) {
                    setText('')
                    return -1
                }
                setText(history[newPos])
                return newPos
            })
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
        </>
    )
}
