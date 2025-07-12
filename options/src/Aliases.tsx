import {useEffect, useState} from "react";
import {Button, Form, Table} from 'react-bootstrap';
import storage from "./storage";

interface AliasDef {
    pattern: string;
    command: string;
}

function Aliases() {
    const [aliases, setAliases] = useState<AliasDef[]>([]);
    const [pattern, setPattern] = useState('');
    const [command, setCommand] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);

    useEffect(() => {
        storage.getItem('aliases').then((value: { aliases: AliasDef[] }) => {
            if (value && value.aliases) {
                setAliases(value.aliases);
            }
        });
    }, []);

    function persist(updated: AliasDef[]) {
        setAliases(updated);
        storage.setItem('aliases', updated).then(() => {
            if (!chrome.runtime) {
                window.dispatchEvent(new CustomEvent('aliases-changed', { detail: updated }));
            }
        });
    }

    function save() {
        if (!pattern.trim() || !command.trim()) return;
        if (aliases.some((a, i) => a.pattern === pattern && i !== editIndex)) return;
        const updated = [...aliases];
        if (editIndex === null) {
            updated.push({ pattern: pattern.trim(), command: command.trim() });
        } else {
            updated[editIndex] = { pattern: pattern.trim(), command: command.trim() };
        }
        setPattern('');
        setCommand('');
        setEditIndex(null);
        persist(updated);
    }

    function startEdit(index: number) {
        const a = aliases[index];
        setPattern(a.pattern);
        setCommand(a.command);
        setEditIndex(index);
    }

    function remove(index: number) {
        if (!confirm('Are you sure you want to delete this alias?')) return;
        const updated = aliases.filter((_, i) => i !== index);
        persist(updated);
    }

    return (
        <div className="m-2 d-flex flex-column gap-3">
            <Table bordered size="sm" className="table-zebra">
                <tbody className="align-middle">
                {aliases.map((a, i) => (
                    <tr key={i}>
                        <td className="w-25">{a.pattern}</td>
                        <td>{a.command}</td>
                        <td className="w-25 text-end">
                            <Button variant="secondary" size="sm" className="me-1" onClick={() => startEdit(i)}>Edit</Button>
                            <Button variant="danger" size="sm" onClick={() => remove(i)}>Remove</Button>
                        </td>
                    </tr>
                ))}
                {aliases.length === 0 && (
                    <tr><td colSpan={3} className="text-center">No aliases</td></tr>
                )}
                </tbody>
            </Table>
            <Form className="d-flex flex-column gap-2">
                <Form.Group>
                    <Form.Label>Pattern</Form.Label>
                    <Form.Control type="text" size="sm" value={pattern} onChange={e => setPattern(e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Command</Form.Label>
                    <Form.Control type="text" size="sm" value={command} onChange={e => setCommand(e.target.value)} />
                </Form.Group>
                <Button size="sm" variant="primary" onClick={save}>{editIndex === null ? 'Create' : 'Save Changes'}</Button>
            </Form>
        </div>
    );
}

export default Aliases;
