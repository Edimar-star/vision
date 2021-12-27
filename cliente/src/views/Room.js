import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import styled from "styled-components";
import '../CSS/Meet.css'
import Opciones from "../components/opciones";
import Chat from "../components/chat";

const StyledVideo = styled.video`
    width: 100%;
    background-color: black;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo id={props.id} playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = ({ socket, username, roomID }) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        socketRef.current = socket;
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userVideo.current.muted = true;
            socketRef.current.emit("join room", { roomID, username, id: socket.id });
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(user => {
                    const peer = createPeer(user.id, socketRef.current.id, stream, username);
                    peersRef.current.push({
                        peerID: user.id,
                        username: user.username,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    username: payload.username,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("out-room", (data) => {
                const peer = peersRef.current.find(p => p.peerID === data.id);
                if(peer){
                    peer.peer.destroy();
                }
                peersRef.current = peersRef.current.filter(p => p.peerID !== data.id);
                const peers = []
                peersRef.current.forEach(p => {
                    if(p.peerID !== data.id) {
                        peers.push(p.peer);
                    }
                })
                setPeers(peers);
                console.log(data.username + " ha salido de la reunion")
            })
        })
    }, []);

    function createPeer(userToSignal, callerID, stream, user) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal, username: user })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <>
            <div className="row">
                <div className="pantallas col-md-9">
                    <div className="row">
                        <div id={socket.id + username} className="screen">
                            <StyledVideo id={socket.id} muted ref={userVideo} autoPlay playsInline />
                            <h6 className="col-md-12" style={{ textAlign: "center" }}>{username}</h6>
                        </div>
                        {peers.map((peer, index) => {
                            const name = peersRef.current.find(p => p.peer === peer);
                            return (
                                <div id={name.peerID + name.username} key={index} className="screen">
                                    <Video id={name.peerID} peer={peer} />
                                    <h6 className="col-md-12" style={{ textAlign: "center" }}>{name.username}</h6>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="panel col-md-3 row justify-content-center align-items-center">
                    <div className="contenedor col-md-11">
                        <div className="row encabezado">
                            <h4 className="col-md-10">Mensajes</h4>
                            <button id="cerrar" className="col-md-2"><i className="fas fa-times"></i></button>
                        </div>
                        <Chat socket={socket} username={username} room={roomID}></Chat>
                    </div>
                </div>
            </div>
            <Opciones roomID={roomID}></Opciones>
        </>
    );
};

export default Room;