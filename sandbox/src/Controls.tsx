import {createPortal} from "react-dom";
import {Button, Modal} from "react-bootstrap";
import {useState} from "react";
import TriggerTester from "./TriggerTester.tsx";
import packageAssistant from "./scenario/package-assistant.ts";
import killCounterDemo from "./scenario/kill-counter-demo.ts";
import itemCollectorDemo from "./scenario/item-collector-demo.ts";
import teamEventsDemo from "./scenario/team-events-demo.ts";
import shipsDemo from "./scenario/ships-demo.ts";
import busesDemo from "./scenario/buses-demo.ts";
import combatDemo from "./scenario/combat-demo.ts";
import combatFullDemo from "./scenario/combat-full-demo.ts";
import compassDemo from "./scenario/compass-demo.ts";
import containersDemo from "./scenario/containers-demo.ts";
import inventoryDemo from "./scenario/inventory-demo.ts";
import lvlCalcDemo from "./scenario/lvl-calc-demo.ts";
import attackBeepDemo from "./scenario/attack-beep-demo.ts";
import depositDemo from "./scenario/deposit-demo.ts";
import stunDemo from "./scenario/stun-demo.ts";
import inviteDemo from "./scenario/invite-demo.ts";

// Demo mapping for localStorage persistence
export const demoMap = {
    'packageAssistant': packageAssistant,
    'killCounterDemo': killCounterDemo,
    'itemCollectorDemo': itemCollectorDemo,
    'teamEventsDemo': teamEventsDemo,
    'shipsDemo': shipsDemo,
    'busesDemo': busesDemo,
    'combatDemo': combatDemo,
    'combatFullDemo': combatFullDemo,
    'compassDemo': compassDemo,
    'containersDemo': containersDemo,
    'inventoryDemo': inventoryDemo,
    'lvlCalcDemo': lvlCalcDemo,
    'attackBeepDemo': attackBeepDemo,
    'depositDemo': depositDemo,
    'stunDemo': stunDemo,
    'inviteDemo': inviteDemo
};

function runDemo(demoName: string) {
    localStorage.setItem('lastDemo', demoName);
    demoMap[demoName as keyof typeof demoMap].run();
}


export function Controls() {
    const [showTester, setShowTester] = useState(false);
    return (
        <>
            {createPortal(
                <div className="d-flex flex-row flex-wrap gap-2 p-2">
                    <Button size="sm" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowTester(true)}>Trigger Tester</Button>
                    <Button size="sm" variant="secondary" onClick={() => runDemo('packageAssistant')}>Asystent
                        paczek</Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('killCounterDemo')}
                    >
                        Kill Counter Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('itemCollectorDemo')}
                    >
                        Item Collector Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('combatDemo')}
                    >
                        Combat Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('combatFullDemo')}
                    >
                        Combat Full
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('compassDemo')}
                    >
                        Compass Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('containersDemo')}
                    >
                        Containers Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('inventoryDemo')}
                    >
                        Inventory Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('depositDemo')}
                    >
                        Deposit Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('lvlCalcDemo')}
                    >
                        Lvl Calc Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('teamEventsDemo')}
                    >
                        Team Events Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('shipsDemo')}
                    >
                        Ships Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('attackBeepDemo')}
                    >
                        Attack Beep Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('busesDemo')}
                    >
                        Buses Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('stunDemo')}
                    >
                        Stun Demo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runDemo('inviteDemo')}
                    >
                        Invite Demo
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
