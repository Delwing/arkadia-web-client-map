import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { getRecordingNames, getRecording, deleteRecording, RecordedEvent } from './recordingStorage';

function Recordings() {
    const [names, setNames] = useState<string[]>([]);

    const load = () => {
        getRecordingNames().then(setNames).catch(() => setNames([]));
    };

    useEffect(load, []);

    async function handlePlay(name: string) {
        const events = await getRecording(name);
        if (!events) return;
        if (chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id!, { type: 'PLAY_RECORDING', events });
                }
            });
        }
    }

    async function handleDelete(name: string) {
        await deleteRecording(name);
        load();
    }

    return (
        <div className="m-2">
            <Table bordered size="sm" className="table-zebra">
                <tbody>
                {names.map(n => (
                    <tr key={n}>
                        <td>{n}</td>
                        <td className="d-flex gap-2">
                            <Button size="sm" onClick={() => handlePlay(n)}>Play</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(n)}>Delete</Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default Recordings;
