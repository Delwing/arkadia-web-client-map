import './App.css'
import {Button, Card, CardBody, Col, Container, Form, Row} from "react-bootstrap";
import {ChangeEvent, useEffect, useState} from "react";
import storage from "./storage.ts";

const guilds = [
    "CKN", "ES", "SC", "KS", "KM", "OS",
    "OHM", "SGW", "PE", "WKS", "LE", "KG",
    "KGKS", "MC", "OK", "RA", "GL", "ZT",
    "ZS", "ZH", "GP", "NPC"
]

interface Settings {
    guilds: string[];
    packageHelper: boolean;
    replaceMap: boolean;
}

function SettingsForm() {

    const [settings, setSettings] = useState<Settings>({
        guilds: [],
        packageHelper: false,
        replaceMap: false
    })

    function onChangeSetting(modifier: (settings: Settings) => void) {
        modifier(settings)
        setSettings(Object.assign({}, settings))
    }

    function onChange(event: ChangeEvent<HTMLInputElement>, guild: string) {
        if (event.target.checked) {
            settings.guilds.push(guild)
        } else {
            settings.guilds.splice(settings.guilds.indexOf(guild), 1)
        }
        setSettings(Object.assign({}, settings))
    }

    function handleSubmission() {
        storage.setItem("settings", settings)
        if (chrome.runtime) {
            window.close()
        }
    }

    useEffect(() => {
        storage.getItem("settings").then(res => {
            setSettings(Object.assign({}, settings, res.settings));
        })
    }, []);


    return (
        <>
            <Container className="my-4">
                <Form>
                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <Form.Group className="mb-3">
                                        <Form.Label><h5>Ładowanie triggerów dla gildii</h5></Form.Label>
                                        <Row>
                                            {guilds.map(guild => (
                                                <Col style={{width: "85px", flex: "0"}} key={guild}>
                                                <Form.Check id={`guild-${guild}`} name={'guild'} value={guild}
                                                            label={guild}
                                                            onChange={event => onChange(event, guild)}
                                                            className={'mx-2'}
                                                            checked={settings.guilds.indexOf(guild) != -1}/>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Form.Group>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <Form.Group className="mb-3">
                                        <Form.Label><h5>Pozostałe opcje</h5></Form.Label>
                                        <Row>
                                            <Col>

                                                    <Form.Check id={'replaceMap'} name={'replaceMap'}
                                                                key={'replaceMap'} label={'Zamień wbudowaną mapę'}
                                                                onChange={event => onChangeSetting((settings) => settings.replaceMap = event.target.checked)}
                                                                className={'mx-2'}
                                                                checked={settings.replaceMap}/>
                                            </Col>
                                            <Col>

                                                <Form.Check id={'packageHelper'} name={'packageHelper'}
                                                            key={'packageHelper'} label={'Asystent paczek'}
                                                            onChange={event => onChangeSetting((settings) => settings.packageHelper = event.target.checked)}
                                                            className={'mx-2'}
                                                            checked={settings.packageHelper}/>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Button className={'mt-2'} onClick={() => handleSubmission()}>Zapisz</Button>
                </Form>
            </Container>
        </>
    )
}

export default SettingsForm
