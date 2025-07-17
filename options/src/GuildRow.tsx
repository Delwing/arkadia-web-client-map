import {ChangeEvent} from "react";
import {Form} from "react-bootstrap";

interface Props {
    guild: string;
    selected: boolean;
    enemySelected: boolean;
    /** currently active color, undefined when disabled */
    color?: string;
    /** default color for the guild */
    defaultColor: string;
    onChange: (guild: string, checked: boolean) => void;
    onEnemyChange: (guild: string, checked: boolean) => void;
    /**
     * when color is undefined color should be disabled
     */
    onColorChange: (guild: string, color?: string) => void;
}

export default function GuildRow({guild, selected, enemySelected, color, defaultColor, onChange, onEnemyChange, onColorChange}: Props) {
    function handleSelect(ev: ChangeEvent<HTMLInputElement>) {
        onChange(guild, ev.target.checked);
    }

    function handleEnemySelect(ev: ChangeEvent<HTMLInputElement>) {
        onEnemyChange(guild, ev.target.checked);
    }

    function handleColorChange(ev: ChangeEvent<HTMLInputElement>) {
        onColorChange(guild, ev.target.value);
    }

    function handleColorToggle(ev: ChangeEvent<HTMLInputElement>) {
        onColorChange(guild, ev.target.checked ? (color ?? defaultColor) : undefined);
    }

    return (
        <div className="mb-2">
            <h6 className="fw-bold mb-1">{guild}</h6>
            <div className="d-flex align-items-center flex-wrap gap-2 ms-2">
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
                <Form.Check
                    type="checkbox"
                    id={`guild-color-enabled-${guild}`}
                    label="Kolor"
                    checked={color !== undefined}
                    onChange={handleColorToggle}
                    className="me-2"
                    disabled={enemySelected}
                />
                <Form.Control
                    type="color"
                    id={`guild-color-${guild}`}
                    value={color ?? defaultColor}
                    onChange={handleColorChange}
                    disabled={enemySelected || color === undefined}
                    style={{width: '3rem'}}
                />
            </div>
        </div>
    );
}
