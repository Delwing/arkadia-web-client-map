import {createPortal} from "react-dom";
import {Button, Modal} from "react-bootstrap";
import {useState} from "react";
import TriggerTester from "./TriggerTester.tsx";
import packageAssistant from "./scenario/package-assistant.ts";
import killCounterDemo from "./scenario/kill-counter-demo.ts";



export function Controls() {
    const [showTester, setShowTester] = useState(false);
    return (
        <>
            {createPortal(
                <div className="d-flex flex-column gap-2">
                    <Button size="sm" className="w-100" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>
                    <Button size="sm" className="w-100" variant="secondary" onClick={() => setShowTester(true)}>Trigger Tester</Button>
                    <Button size="sm" className="w-100" variant="secondary" onClick={() => packageAssistant.run()}>Asystent paczek</Button>
                    <Button
                        size="sm"
                        className="w-100"
                        variant="secondary"
                        onClick={() => killCounterDemo.run()}
                    >
                        Kill Counter Demo
                    </Button>
                </div>,
                document.getElementById('sandbox-buttons')!,
            )}
            <Modal show={showTester} onHide={() => setShowTester(false)} fullscreen>
                <Modal.Header closeButton>
                    <Modal.Title>Trigger Tester</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TriggerTester />
                </Modal.Body>
            </Modal>
        </>
    );
}
