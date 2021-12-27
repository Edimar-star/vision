import React, { useState, useEffect } from 'react';

function Chat({ socket, username, room }) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const sendMessage = async () => {
        if (currentMessage !== "" && currentMessage.trim() !== "") {
            const messageData = {
                room: room,
                author: username,
                id: socket.id,
                message: currentMessage,
                time:
                    new Date(Date.now()).getHours() +
                    ":" +
                    new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData)
            setMessageList(msg => msg.concat(messageData));
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessageList(msg => msg.concat(data));
        });
    }, []);

    return (
        <div className="row">
            <div id="mensajes">
                {messageList.map((msg, i) => {
                    return (
                        <div key={i} style={{ marginBottom: "20px" }} className="col-md-11">
                            <div className="row justify-content-start">
                                <p style={{ textAlign: "start" }}><b>{msg.id == socket.id ? "Tú" : msg.author}</b> {msg.time}</p>
                                <p style={{ WordWrap: "break-Word", textAlign: "justify" }}>{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="input-group mb-3 area">
                <textarea style={{ resize: "none" }} className="form-control subarea" value={currentMessage} onChange={(e) => {
                    setCurrentMessage(e.target.value);
                }} placeholder="Envia un mensaje" onKeyPress={(e) => {
                    e.key == "Enter" && sendMessage();
                }} aria-label="Envia un mensaje" aria-describedby="button-addon2"></textarea>
                <button className="btn btn-outline-secondary subarea send" onClick={sendMessage} id="button-addon2">Enviar</button>
            </div>
        </div>
    );
}

export default Chat;