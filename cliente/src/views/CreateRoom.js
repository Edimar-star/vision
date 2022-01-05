import { v1 as uuid } from "uuid";
import '../CSS/CreateRoom.css';
import img from '../imagenes/Icon.png';
import fondo from '../imagenes/promo3.png';
import swal from 'sweetalert2';
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Room from './Room';

const CreateRoom = () => {

    const [showRoom, setShowRoom] = useState(false);
    const [socket, setSocket] = useState(io.connect("http://localhost:3001", { transports: ['websocket'] }));
    const [roomID, setRoomID] = useState("");
    const [username, setUsername] = useState("");

    const createRoom = () => {
        const user = document.getElementById('floatingInput').value;
        if (user !== "") {
            setUsername(user);
            setRoomID(uuid());
            setShowRoom(true);
        } else {
            swal.fire({
                title: "El nombre de usuario es requerido",
                icon: "error"
            });
        }
    }

    const into = () => {
        const user = document.getElementById('floatingInput').value;
        const room = document.getElementById('floatingPassword').value;
        if (room !== "" && user !== "") {
            setUsername(user);
            setRoomID(room);
            socket.emit("into", room);
        } else {
            swal.fire({
                title: "Todos los campos son requeridos para entrar a una reunion en curso",
                icon: "error"
            });
        }
    }

    useEffect(() => {
        socket.on("existe-room", (existe) => {
            if (existe) {
                setShowRoom(existe);
            } else {
                swal.fire({
                    title: "Codigo de reunion inexistente",
                    icon: "error"
                });
            }
        })
        socket.on("room-full", () => {
            swal.fire({
                title: "Reunion llena",
                icon: "error"
            });
        })
    }, [showRoom === false]);

    return (
        <div>
            {!showRoom ? (
                <div className="App">
                    <div className="row padre justify-content-around align-items-center">
                        <div className="formulario col-md-4">
                            <div className="row justify-content-end">
                                <img className="col-md-2" src={img} />
                            </div>
                            <div className="row">
                                <h3 style={{ textAlign: "center", marginBoottom: "5px", color: "white" }} className="col-md-12">Crea o unete a una sala</h3>
                            </div>
                            <div className="row">
                                <div className="form-floating mb-3">
                                    <input type="text" id="floatingInput" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
                                    <label style={{ paddingLeft: "25px" }} htmlFor="floatingInput">Usuario</label>
                                </div>
                                <div className="form-floating">
                                    <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                                    <label style={{ paddingLeft: "25px" }} htmlFor="floatingPassword">Contraseña</label>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <button onClick={into} id="crear" type="button" className="btn btn-outline-light col-md-5">Entrar</button>
                                <button type="button" onClick={createRoom} className="btn btn-outline-light col-md-5">crear</button>
                            </div>
                        </div>
                        <img className="fondo col-md-4" src={fondo} />
                    </div>
                    <div className="burbujas">
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                        <div className="burbuja"></div>
                    </div>
                </div>
            ) : (
                <Room socket={socket} username={username} roomID={roomID}></Room>
            )}
        </div>
    );
};

export default CreateRoom;