import {createPortal} from "react-dom";
import {Button} from "react-bootstrap";

export function Controls() {
    return (
        <>
            {createPortal(
                <Button size="sm" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>,
                document.getElementById('controls')!
            )}
            {createPortal(
                <div className="d-flex flex-column gap-2">
                    <Button size="sm" variant="primary">Button 1</Button>
                    <Button size="sm" variant="primary">Button 2</Button>
                    <Button size="sm" variant="primary">Button 3</Button>
                </div>,
                document.getElementById('sandbox-buttons')!
            )}
        </>
    );
}
