import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "react-bootstrap";
import storage from "./storage";
import GuildSection from "./GuildSection";
import guilds from "./guilds";

function Guilds() {
    const [selected, setSelected] = useState<string[]>([]);
    const [enemySelected, setEnemySelected] = useState<string[]>([]);
    const [colors, setColors] = useState<Record<string, string>>({});

    useEffect(() => {
        storage.getItem("settings").then(res => {
            if (res && res.settings) {
                setSelected(res.settings.guilds || []);
                setEnemySelected(res.settings.enemyGuilds || []);
                setColors(res.settings.guildColors || {});
            }
        });
    }, []);

    function onChange(guild: string, checked: boolean) {
        setSelected(prev => checked ? [...prev, guild] : prev.filter(g => g !== guild));
    }

    function onEnemyChange(guild: string, checked: boolean) {
        setEnemySelected(prev => checked ? [...prev, guild] : prev.filter(g => g !== guild));
    }

    function onColorChange(guild: string, color: string) {
        setColors(prev => ({...prev, [guild]: color}));
    }

    function onChangeAll(checked: boolean) {
        setSelected(checked ? [...guilds] : []);
    }

    function onChangeAllEnemy(checked: boolean) {
        setEnemySelected(checked ? [...guilds] : []);
    }

    function save() {
        storage.getItem("settings").then(res => {
            const settings = { ...(res.settings || {}), guilds: selected, enemyGuilds: enemySelected, guildColors: colors };
            storage.setItem("settings", settings).then(() => {
                window.dispatchEvent(new Event('close-options'));
            });
        });
    }

    return (
        <div className="m-2">
            <GuildSection
                selected={selected}
                enemySelected={enemySelected}
                colors={colors}
                onChange={onChange}
                onEnemyChange={onEnemyChange}
                onColorChange={onColorChange}
                onChangeAll={onChangeAll}
                onChangeAllEnemy={onChangeAllEnemy}
            />
            <Button onClick={save}>Zapisz</Button>
        </div>
    );
}

export default Guilds;
