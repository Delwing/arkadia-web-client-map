import {ChangeEvent} from "react";
import {Form} from "react-bootstrap";

interface Props {
    guild: string;
    selected: boolean;
    enemySelected: boolean;
    color: string;
    onChange: (guild: string, checked: boolean) => void;
    onEnemyChange: (guild: string, checked: boolean) => void;
    onColorChange: (guild: string, color: string) => void;
}

export default function GuildRow({guild, selected, enemySelected, color, onChange, onEnemyChange, onColorChange}: Props) {
    function handleSelect(ev: ChangeEvent<HTMLInputElement>) {
        onChange(guild, ev.target.checked);
    }

    function handleEnemySelect(ev: ChangeEvent<HTMLInputElement>) {
        onEnemyChange(guild, ev.target.checked);
    }

    function handleColorChange(ev: ChangeEvent<HTMLInputElement>) {
        onColorChange(guild, ev.target.value);
    }

    return (
        <div className="mb-2">
            <h6 className="fw-bold mb-1">{guild}</h6>
            <div className="d-flex flex-wrap gap-2 ms-2">
                <Form.Check
                    type="checkbox"
                    id={`guild-${guild}`}
                    label="Ładowanie triggerów"
                    checked={selected}
                    onChange={handleSelect}
                    className="me-2"
                />
                <Form.Check
                    type="checkbox"
                    id={`enemy-guild-${guild}`}
                    label="Wróg"
                    checked={enemySelected}
                    onChange={handleEnemySelect}
                    className="me-2"
                />
                <Form.Group className="d-flex align-items-center me-2">
                    <Form.Label className="me-1 mb-0">Kolor:</Form.Label>
                    <Form.Control
                        type="color"
                        id={`guild-color-${guild}`}
                        value={color}
                        onChange={handleColorChange}
                        disabled={enemySelected}
                        style={{width: '3rem'}}
                    />
                </Form.Group>
            </div>
        </div>
    );
}
