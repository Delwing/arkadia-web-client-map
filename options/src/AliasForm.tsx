import {useEffect, useState} from 'react'
import {Button, Form} from 'react-bootstrap'

export interface AliasFormProps {
    initial?: { pattern: string; command: string }
    onSave: (pattern: string, command: string) => void
    onCancel?: () => void
}

function AliasForm({initial, onSave, onCancel}: AliasFormProps) {
    const [pattern, setPattern] = useState('')
    const [command, setCommand] = useState('')

    useEffect(() => {
        setPattern(initial?.pattern ?? '')
        setCommand(initial?.command ?? '')
    }, [initial])

    const handleSave = () => {
        if (!pattern.trim() || !command.trim()) return
        onSave(pattern.trim(), command.trim())
        setPattern('')
        setCommand('')
    }

    return (
        <Form className="d-flex flex-column gap-2">
            <Form.Group>
                <Form.Label>Pattern</Form.Label>
                <Form.Control type="text" size="sm" value={pattern} onChange={e => setPattern(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Command</Form.Label>
                <Form.Control type="text" size="sm" value={command} onChange={e => setCommand(e.target.value)} />
            </Form.Group>
            <div className="d-flex gap-2">
                <Button size="sm" variant="primary" onClick={handleSave}>{initial ? 'Save Changes' : 'Create'}</Button>
                {initial && onCancel && (
                    <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
                )}
            </div>
        </Form>
    )
}

export default AliasForm
