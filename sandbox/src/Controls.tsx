import {createPortal} from "react-dom";
import {Button, Modal} from "react-bootstrap";
import {useState} from "react";
import TriggerTester from "./TriggerTester.tsx";


export function Controls() {
    const [showTester, setShowTester] = useState(false);
    return (
        <>
            {createPortal(
                <div className="d-flex flex-column gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowTester(true)}>Trigger Tester</Button>
                    <Button size="sm" variant="secondary">Button 2</Button>
                    <Button size="sm" variant="secondary">Button 3</Button>
                </div>,
                document.getElementById('sandbox-buttons')!,
            )}
            <Modal show={showTester} onHide={() => setShowTester(false)} size="lg">
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
