import {createPortal} from "react-dom";

export function Controls() {

    return <>
        {createPortal(
            <button className="btn btn-sm" onClick={() => window.Output.clear()}>Reset</button>,
            document.getElementById('controls')!,
        )}
    </>
}
