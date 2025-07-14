import { useEffect, useState, ChangeEvent } from "react";
import { Button, Form } from "react-bootstrap";
import { TiDelete, TiEdit } from "react-icons/ti";
import storage from "./storage";

interface Alias {
    pattern: string;
    command: string;
}

function Aliases() {
    const [aliases, setAliases] = useState<Alias[]>([]);
    const [pattern, setPattern] = useState("");
    const [command, setCommand] = useState("");
    const [editIndex, setEditIndex] = useState<number | null>(null);

    useEffect(() => {
        storage.getItem("aliases").then(res => {
            if (res && Array.isArray(res.aliases)) {
                setAliases(res.aliases);
            }
        });
    }, []);

    function saveList(list: Alias[]) {
        setAliases(list);
        storage.setItem("aliases", list);
    }

    function resetForm() {
        setPattern("");
        setCommand("");
        setEditIndex(null);
    }

    function save() {
        const p = pattern.trim();
        const c = command.trim();
        if (!p || !c) return;
        if (aliases.some((a, i) => i !== editIndex && a.pattern === p)) {
            alert("Alias already exists");
            return;
        }
        const updated = [...aliases];
        const entry = { pattern: p, command: c };
        if (editIndex === null) {
            updated.push(entry);
        } else {
            updated[editIndex] = entry;
        }
        saveList(updated);
        resetForm();
    }

    function edit(idx: number) {
        const a = aliases[idx];
        setPattern(a.pattern);
        setCommand(a.command);
        setEditIndex(idx);
    }

    function remove(idx: number) {
        if (!confirm("Are you sure you want to delete this alias?")) return;
        const updated = aliases.filter((_, i) => i !== idx);
        saveList(updated);
    }

    return (
        <div className="m-2 d-flex flex-column gap-2">
            <Form.Group className="d-flex flex-column flex-sm-row align-items-center gap-2 alias-form-group">
                <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Pattern"
                    value={pattern}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPattern(e.target.value)}
                    style={{width: '100%', maxWidth: '8rem'}}
                />
                <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Command"
                    value={command}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCommand(e.target.value)}
                    style={{width: '100%', maxWidth: '12rem'}}
                />
                <Button size="sm" onClick={save}>{editIndex === null ? 'Dodaj' : 'Zapisz'}</Button>
                {editIndex !== null && (
                    <Button size="sm" variant="secondary" onClick={resetForm}>Anuluj</Button>
                )}
            </Form.Group>
            <ul className="list-unstyled ms-3">
                {aliases.map((a, i) => (
                    <li key={i} className="d-flex align-items-center gap-2 alias-list-item">
                        <span>{a.pattern}</span>
                        <span className="text-secondary">→</span>
                        <span>{a.command}</span>
                        <Button size="sm" variant="secondary" onClick={() => edit(i)}><TiEdit /></Button>
                        <Button size="sm" variant="danger" onClick={() => remove(i)}><TiDelete /></Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Aliases;
