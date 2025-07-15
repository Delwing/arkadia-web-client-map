import { useEffect, useState } from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import { getRecordingNames, deleteRecording, getRecording } from './recordingStorage';

function Recordings() {
    const [names, setNames] = useState<string[]>([]);
    const [recordingName, setRecordingName] = useState('');
    const [recording, setRecording] = useState(false);

    const load = () => {
        getRecordingNames().then(setNames).catch(() => setNames([]));
    };

    useEffect(load, []);

    function activeTabAction(msg: any) {
        chrome.tabs?.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id!, msg);
            }
        });
    }

    async function handlePlay(name: string) {
        if (window.client) {
            await window.client.loadRecording(name);
            window.client.replayRecordedMessages();
        } else {
            const events = await getRecording(name);
            if (!events) return;
            activeTabAction({ type: 'PLAY_RECORDING', events });
        }
    }

    async function handlePlayTimed(name: string) {
        if (window.client) {
            await window.client.loadRecording(name);
            window.client.replayRecordedMessagesTimed();
        } else {
            const events = await getRecording(name);
            if (!events) return;
            activeTabAction({ type: 'PLAY_RECORDING_TIMED', events });
        }
    }

    async function handleDelete(name: string) {
        if (window.client) {
            await window.client.deleteRecording(name);
            load();
        } else {
            await deleteRecording(name);
            load();
        }
    }

    function start() {
        const name = recordingName.trim();
        if (!name) return;
        if (window.client) {
            window.client.startRecording(name);
        } else {
            activeTabAction({ type: 'START_RECORDING', name });
        }
        setRecording(true);
    }

    async function stop(save: boolean) {
        if (window.client) {
            await window.client.stopRecording(save);
            if (save) load();
        } else {
            activeTabAction({ type: 'STOP_RECORDING', save });
        }
        setRecording(false);
    }

    return (
        <div className="m-2 d-flex flex-column gap-3">
            <Form.Group className="d-flex gap-2 align-items-center">
                <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Recording name"
                    value={recordingName}
                    onChange={e => setRecordingName(e.target.value)}
                    disabled={recording}
                    style={{ maxWidth: '10rem' }}
                />
                {recording ? (
                    <>
                        <Button size="sm" variant="secondary" onClick={() => stop(false)}>Stop</Button>
                        <Button size="sm" onClick={() => stop(true)}>Stop &amp; Save</Button>
                    </>
                ) : (
                    <Button size="sm" onClick={start}>Start</Button>
                )}
            </Form.Group>
            <Table bordered size="sm" className="table-zebra">
                <tbody>
                {names.map(n => (
                    <tr key={n}>
                        <td>{n}</td>
                        <td className="d-flex gap-2">
                            <Button size="sm" onClick={() => handlePlay(n)}>Play</Button>
                            <Button size="sm" onClick={() => handlePlayTimed(n)}>Play timed</Button>
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
