import {createPortal} from "react-dom";
import {Button} from "react-bootstrap";

export function Controls() {
    return (
        <>
            {createPortal(
                <div className="d-flex flex-column gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.Output.clear()}>Reset</Button>
                    <Button size="sm" variant="secondary">Button 1</Button>
                    <Button size="sm" variant="secondary">Button 2</Button>
                    <Button size="sm" variant="secondary">Button 3</Button>
                </div>,
                document.getElementById('sandbox-buttons')!
            )}
        </>
    );
}
