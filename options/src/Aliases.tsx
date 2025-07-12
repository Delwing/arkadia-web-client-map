import {useEffect, useState} from "react";
import storage from "./storage";
import AliasForm from "./AliasForm";
import AliasList, { AliasDef } from "./AliasList";

function Aliases() {
    const [aliases, setAliases] = useState<AliasDef[]>([]);
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

    function save(pattern: string, command: string) {
        if (aliases.some((a, i) => a.pattern === pattern && i !== editIndex)) return;
        const updated = [...aliases];
        if (editIndex === null) {
            updated.push({ pattern, command });
        } else {
            updated[editIndex] = { pattern, command };
        }
        setEditIndex(null);
        persist(updated);
    }

    function startEdit(index: number) {
        setEditIndex(index);
    }

    function remove(index: number) {
        if (!confirm('Are you sure you want to delete this alias?')) return;
        const updated = aliases.filter((_, i) => i !== index);
        persist(updated);
    }

    return (
        <div className="m-2 d-flex flex-column gap-3">
            <AliasList aliases={aliases} onEdit={startEdit} onRemove={remove} />
            <AliasForm
                initial={editIndex !== null ? aliases[editIndex] : undefined}
                onSave={save}
                onCancel={() => setEditIndex(null)}
            />
        </div>
    );
}

export default Aliases;
