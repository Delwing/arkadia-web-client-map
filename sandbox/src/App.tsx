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
            <form onSubmit={(e) => {
                e.preventDefault();
                send()
            }} className="mt-3 flex">
                <input ref={input} value={text} onKeyDown={handleKeyDown} onKeyUp={handleKeys}
                       onChange={event => setText(event.currentTarget.value)}
                       className="flex-grow bg-transparent border border-gray-600 rounded-l px-2 py-1" />
                <button type="button" onClick={send}
                        className="bg-gray-600 text-white px-3 rounded-r">Wyślij</button>
            </form>
            <TriggerTester/>
        </>
    )
}
