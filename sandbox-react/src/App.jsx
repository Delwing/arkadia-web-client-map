import {Form} from "react-bootstrap";
import {useState} from "react";


export default function App() {

    const [text, setText] = useState('')

    function send() {
        window.clientExtension.fake(text)
        setText('')
    }

    function handleKeys(ev) {
        if (ev.keyCode === 13) {
            send()
        }
    }

    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                send()
            }}>
                <Form.Control as={'textarea'} className={'mt-2'} value={text} onKeyUp={handleKeys}
                              onChange={event => setText(event.currentTarget.value)}></Form.Control>
            </Form>
        </>
    )
}
