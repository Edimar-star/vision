import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

function Ventana({ setUsername }) {
    const [show, setShow] = useState(true);
    const handleClose = () => {
        setUsername(document.getElementById('floatingInput').value);
        setShow(false);
    }

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header style={{ border: "none" }}>
                    <Modal.Title>Ingrese su nombre de usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-floating mb-3">
                        <input type="text" id="floatingInput" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
                        <label style={{ paddingLeft: "25px" }} htmlFor="floatingInput">Usuario</label>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }}>
                    <Button id="add-user" onClick={handleClose} variant="primary">Aceptar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Ventana;