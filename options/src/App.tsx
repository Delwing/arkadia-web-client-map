import './App.css'
import {Button, Card, CardBody, Col, Container, Form, Row} from "react-bootstrap";
import {ChangeEvent, useEffect, useState} from "react";

const guilds = [
    "CKN", "ES", "SC", "KS", "KM", "OS",
    "OHM", "SGW", "PE", "WKS", "LE", "KG",
    "KGKS", "MC", "OK", "RA", "GL", "ZT",
    "ZS", "ZH", "GP", "NPC"
]

function App() {

    const [settings, setSettings] = useState({
        guilds: [...guilds]
    })

    function onChange(event: ChangeEvent<HTMLInputElement>, guild: string) {
        if (event.target.checked) {
            settings.guilds.push(guild)
        } else {
            settings.guilds.splice(settings.guilds.indexOf(guild), 1)
        }
        setSettings(Object.assign({}, settings))
    }

    function handleSubmission() {
        chrome.storage.local.set({"settings": settings})
    }

    useEffect(() => {
        chrome.storage.local.get("settings").then(res => {
            setSettings(Object.assign({}, settings, res.settings));
        })
    }, []);

    return (
        <>
            <Container className="my-4">
                <h2 className={'mb-4'}>Ustawienia</h2>
                <Form>
                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <Form.Group className="mb-3">
                                        <Form.Label><h5>Ładowanie triggerów dla gildii</h5></Form.Label>
                                        <Row>
                                            {guilds.map(guild => (
                                                <Col style={{width: "85px", flex: "0"}}>
                                                <Form.Check id={`guild-${guild}`} name={'guild'} value={guild}
                                                             key={guild} label={guild}
                                                            onChange={event => onChange(event, guild)}
                                                            className={'mx-2'}
                                                            checked={settings.guilds.indexOf(guild) != -1}/>
                                                </Col>
                                            ))}
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

export default App
