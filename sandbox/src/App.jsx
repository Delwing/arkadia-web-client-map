import {Button, Form, InputGroup} from "react-bootstrap";
import {createRef, useRef, useState} from "react";
import {Controls} from "./Controls.jsx";


export default function App() {

    const [text, setText] = useState('')
    const input = createRef();

    function send() {
        //window.clientExtension.fake(text)
        Input.send(text.trim())
        input?.current.select()
    }

    function handleKeyDown(ev) {
        if (ev.keyCode === 13 && !ev.shiftKey) {
            ev.preventDefault()
        }
    }

    function handleKeys(ev) {
        if (ev.keyCode === 13 && !ev.shiftKey) {
            ev.preventDefault()
            send()
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
