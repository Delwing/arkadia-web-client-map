import {Button, Table} from 'react-bootstrap'

export interface AliasDef {
    pattern: string;
    command: string;
}

interface Props {
    aliases: AliasDef[];
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
}

function AliasList({aliases, onEdit, onRemove}: Props) {
    return (
        <Table bordered size="sm" className="table-zebra">
            <tbody className="align-middle">
            {aliases.map((a, i) => (
                <tr key={i}>
                    <td className="w-25">{a.pattern}</td>
                    <td>{a.command}</td>
                    <td className="w-25 text-end">
                        <Button variant="secondary" size="sm" className="me-1" onClick={() => onEdit(i)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => onRemove(i)}>Remove</Button>
                    </td>
                </tr>
            ))}
            {aliases.length === 0 && (
                <tr><td colSpan={3} className="text-center">No aliases</td></tr>
            )}
            </tbody>
        </Table>
    )
}

export default AliasList
