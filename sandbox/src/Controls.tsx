import {createPortal} from "react-dom";
import {Button, Modal} from "react-bootstrap";
import {useState} from "react";
import TriggerTester from "./TriggerTester.tsx";
import packageAssistant from "./scenario/package-assistant.ts";
import killCounterDemo from "./scenario/kill-counter-demo.ts";
import teamEventsDemo from "./scenario/team-events-demo.ts";
import combatDemo from "./scenario/combat-demo.ts";
import compassDemo from "./scenario/compass-demo.ts";
import containersDemo from "./scenario/containers-demo.ts";
import inventoryDemo from "./scenario/inventory-demo.ts";
import lvlCalcDemo from "./scenario/lvl-calc-demo.ts";


export function Controls() {
    const [showTester, setShowTester] = useState(false);
    return (
        <>
            {createPortal(
                <div className="d-flex flex-row flex-wrap gap-2 p-2">
                    <Button size="sm" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowTester(true)}>Trigger Tester</Button>
                    <Button size="sm" variant="secondary" onClick={() => packageAssistant.run()}>Asystent
                        paczek</Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => killCounterDemo.run()}
                    >
                        Kill Counter Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => combatDemo.run()}
                    >
                        Combat Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => compassDemo.run()}
                    >
                        Compass Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => containersDemo.run()}
                    >
                        Containers Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => inventoryDemo.run()}
                    >
                        Inventory Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => lvlCalcDemo.run()}
                    >
                        Lvl Calc Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => teamEventsDemo.run()}
                    >
                        Team Events Demo
                    </Button>
                </div>,
                document.getElementById('sandbox-buttons')!,
            )}
            <Modal show={showTester} onHide={() => setShowTester(false)} fullscreen>
                <Modal.Header closeButton>
                    <Modal.Title>Trigger Tester</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TriggerTester/>
                </Modal.Body>
            </Modal>
        </>
    );
}
