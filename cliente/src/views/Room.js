import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import styled from "styled-components";
import '../CSS/Meet.css'
import Opciones from "../components/opciones";
import Chat from "../components/chat";
import $ from 'jquery';

const StyledVideo = styled.video`
    width: 100%;
`;

const Video = ({ peer, id }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
        peer.on("close", () => {
            peer.destroy();
        })
    }, []);

    return (
        <StyledVideo id={id} playsInline autoPlay ref={ref} />
    );
}

const Room = ({ socket, username, roomID }) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const screenVideo = useRef();

    useEffect(() => {
        socketRef.current = socket;
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", { roomID, username, id: socket.id });
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(user => {
                    const peer = createPeer(user.id, socketRef.current.id, stream, username);

                    peersRef.current.push({
                        peerID: user.id,
                        username: user.username,
                        peerScreen: null,
                        peer,
                    })

                    peers.push(peer);
                })
                setPeers(peers);
            })

            const transition = () => {
                var t = document.querySelector('.join');

                if (t && (document.querySelector('.fin') === undefined || document.querySelector('.fin') == null)) {
                    t.className = 'out'
                } else {
                    t = document.querySelector('.out');
                    t.className = 'join fin'
                }

                return t;
            }

            socketRef.current.on("new screen", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.callerID);
                item.peerScreen = addPeerScreen(payload.signal, payload.callerID);
            })

            socketRef.current.on("receiving new screen", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peerScreen.signal(payload.signal);
            })

            socketRef.current.on("stop", () => {
                document.querySelector('video').id = "";
                peersRef.current.map(p => {
                    p.peerScreen.destroy();
                })
                screenVideo.current.srcObject.getTracks()[0].stop();
                screenVideo.current.srcObject = null;
            })

            socketRef.current.on("user joined", payload => {
                //var el = transition();

                console.log(payload.username + " ha entrado a la reunion")
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    username: payload.username,
                    peerScreen: (document.querySelector('video').id === socketRef.current.id) ?
                        createScreenPeer(payload.callerID, socketRef.current.id,
                            document.querySelector('video').srcObject, username) : null,
                    peer,
                })

                setPeers(users => [...users, peer]);
                //el.addEventListener("transitionend", transition, false);
                //$('#join').toggleClass('fin');
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("out-room", (data) => {
                const peer = peersRef.current.find(p => p.peerID === data.id);
                peer.peer.destroy();
                peersRef.current = peersRef.current.filter(p => p.peerID !== data.id);
                const peers = []
                peersRef.current.forEach(p => {
                    if (p.peerID !== data.id) {
                        peers.push(p.peer);
                    }
                })
                setPeers(peers);
                console.log(data.username + " ha salido de la reunion")
            })

            socketRef.current.on("video", data => {
                const video = document.getElementById(data.signal);
                video.srcObject.getVideoTracks()[0].enabled = data.condicion;
            })

            socketRef.current.on("audio", data => {
                const video = document.getElementById(data.signal);
                video.srcObject.getAudioTracks()[0].enabled = data.condicion;
            })

        })

        $('#video').on('click', () => {
            const video = $('#video').children();
            if (video.hasClass('fa-video-slash')) {//Activar video
                userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
                AudioVideo("video", true);
            } else {//Desactivar video
                userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
                AudioVideo("video", false);
            }
            video.toggleClass('fa-video-slash');
            video.toggleClass('fa-video');
        })

        $('#microphone').on('click', () => {
            const audio = $('#microphone').children();
            if (audio.hasClass('fa-microphone-slash')) {//Activar video
                userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
                AudioVideo("audio", true);
            } else {//Desactivar video
                userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
                AudioVideo("audio", false);
            }
            audio.toggleClass('fa-microphone-slash');
            audio.toggleClass('fa-microphone');
        })

        $('#shareScreen').on("click", () => {
            if (screenVideo.current.srcObject === null || screenVideo.current.srcObject === undefined) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {
                    screenVideo.current.srcObject = stream;
                    document.querySelector('video').id = socketRef.current.id;
                    peersRef.current.map(p => {
                        p.peerScreen = createScreenPeer(p.peerID, socketRef.current.id, stream, username);
                    })
                })
            } else {
                if (document.querySelector('video').id === socketRef.current.id) {
                    document.querySelector('video').id = "";
                    peersRef.current.map(p => {
                        p.peerScreen.destroy();
                        socketRef.current.emit("stop", p.peerID);
                    })
                    screenVideo.current.srcObject.getTracks()[0].stop();
                    screenVideo.current.srcObject = null;
                }
            }
        })

    }, []);

    function createPeer(userToSignal, callerID, stream, user) {
        const peer = new Peer({ initiator: true, trickle: false, stream, });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal, username: user })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream, })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function createScreenPeer(userToSignal, callerID, stream, user) {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signalScreen", { userToSignal, callerID, signal, username: user })
        })

        return peer;
    }

    function addPeerScreen(incomingSignal, callerID) {
        const peer = new Peer({ initiator: false, trickle: false })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signalScreen", { signal, callerID })
        })

        peer.on("stream", stream => {
            screenVideo.current.srcObject = stream;
            document.querySelector('video').id = peersRef.current.find(p => p.peerScreen === peer).peerID;
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function AudioVideo(msg, condicion) {
        peersRef.current.map(p => {
            socketRef.current.emit(msg, { id: p.peerID, condicion, signal: socketRef.current.id });
        })
    }

    return (
        <div className="row">
            <div className="col-md-9" style={{ padding: "16px" }}>
                <div className="row content">
                    <div className="row col-md-9 justify-content-center">
                        <video className="col-md-12" ref={screenVideo} muted autoPlay playsInline />
                    </div>
                    <div className="pantallas col-md-3">
                        <div className="row">
                            <div id={socket.id + username} className="screen card">
                                <StyledVideo id={socket.id} muted ref={userVideo} autoPlay playsInline />
                                <div className="card-img-overlay">
                                    <h6>{username}</h6>
                                </div>
                            </div>
                            {peers.map((peer, index) => {
                                const name = peersRef.current.find(p => p.peer === peer);
                                return (
                                    <div id={name.peerID + name.username} key={index} className="screen card">
                                        <Video id={name.peerID} peer={peer} />
                                        <div className="card-img-overlay">
                                            <h6>{name.username}</h6>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <Opciones roomID={roomID}></Opciones>
            </div>
            <div className="panel col-md-3">
                <div className="contenedor col-md-12">
                    <div className="row encabezado align-items-center">
                        <h4 className="col-md-10">Mensajes</h4>
                        <button id="cerrar"><i className="fas fa-times"></i></button>
                        <hr />
                    </div>
                    <Chat socket={socket} username={username} room={roomID}></Chat>
                </div>
            </div>
        </div>
    );
};

export default Room;