import {createPortal} from "react-dom";

export function Controls() {

    return <>
        {createPortal(
            <button className="text-sm bg-gray-600 text-white px-2 py-1 rounded" onClick={() => window.Output.clear()}>Reset</button>,
            document.getElementById('controls')!,
        )}
    </>
}
