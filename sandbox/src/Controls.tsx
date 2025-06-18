import {createPortal} from "react-dom";
import {Button} from "react-bootstrap";

export function Controls() {

    return <>
        {createPortal(
            <Button size={"sm"} variant={'secondary'} onClick={() => window.Output.clear()}>Reset</Button>,
            document.getElementById('controls')!
        )}
    </>
}