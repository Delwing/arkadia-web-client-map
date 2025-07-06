import 'bootstrap/dist/css/bootstrap.css';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import OptionsApp from '@options/src/App.tsx';

let openModal: () => void = () => {};

function OptionsPortal() {
    const [show, setShow] = useState(false);
    openModal = () => setShow(true);
    return (
        <Modal show={show} onHide={() => setShow(false)} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <OptionsApp />
            </Modal.Body>
        </Modal>
    );
}

export function setupOptionsModal() {
    const container = document.getElementById('options-root');
    if (container) {
        const root = createRoot(container);
        root.render(<OptionsPortal />);
    }
}

export function openOptionsModal() {
    openModal();
}
