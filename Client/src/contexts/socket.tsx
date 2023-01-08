import { PEER_HOST, PEER_PATH, PEER_PORT, SOCKET_IO_ENDPOINT } from "@constants";
import React, { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MediaConnection, Peer } from "peerjs"
import { useAuth } from "./auth";
import { generateUUID } from "@helpers/random";
import { User } from "@api";
import { NotificationTypes, showNotification } from "@helpers/notifications";

let socket: Socket
let peer: Peer

const ROOM = generateUUID()

const getDisplayMediaConstraints = (params: { width: number, height: number, framerate: number }) => {
    const displayMediaConstraints: MediaStreamConstraints = {
        video: {
            width: params.width,
            height: params.height,
            aspectRatio: {
                ideal: 16 / 9
            },
            frameRate: {
                ideal: params.framerate,
                max: 240
            }
        },
        audio: true
    }
    return displayMediaConstraints;
}

const getUserMediaConstraints = () => {
    const userMediaContraints: MediaStreamConstraints = {
        video: {
            facingMode: "user",
            width: window.screen.width,
            height: window.screen.height,
            frameRate: {
                ideal: 30,
                max: 60
            },
            aspectRatio: {
                ideal: 3 / 4
            }
        },
        audio: {
            noiseSuppression: true,
            echoCancellation: true,
            suppressLocalAudioPlayback: true,
            autoGainControl: true
        }
    }
    return userMediaContraints;
}

export interface ISocketProps {
    children: ReactNode
}

export interface IUserConnected {
    peerId: string
    user: User
    socketId: string
}

export interface ISocketContextData {
    socket: Socket
    peer: Peer
    stream: MediaStream | null
    usersConnected: { [userId: string]: IUserConnected & { roomId: string } }
    peerError: false | string
    socketError: false | string
    setParams: React.Dispatch<React.SetStateAction<ISocketParams | null>>
    setResolution: React.Dispatch<React.SetStateAction<number[]>>,
    setFrameRate: React.Dispatch<React.SetStateAction<number>>,
    setReplaceVideo: React.Dispatch<React.SetStateAction<boolean>>,
    resolution: number[],
    frameRate: number,
    roomId: string
    roomName: string
}

export interface ISocketParams {
    isStreaming: boolean
    roomName: string
    roomId?: string
}

export const SocketContext = createContext<ISocketContextData>({} as ISocketContextData);
export const SocketContextProvider: React.FC<ISocketProps> = ({ children }: ISocketProps) => {
    const auth = useAuth()

    const [params, setParams] = useState<ISocketParams | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [peersConnected, setPeersConnected] = useState<{ [peerId: string]: { call: MediaConnection, user: User, socketId: string } }>({});
    const [usersConnected, setUsersConnected] = useState<{ [userId: string]: IUserConnected & { roomId: string } }>({});
    const [socketError, setSocketError] = useState<false | string>(false);
    const [peerError, setPeerError] = useState<false | string>(false);
    const [roomName, setRoomName] = useState("");
    const [resolution, setResolution] = useState<number[]>([1280, 720]);
    const [frameRate, setFrameRate] = useState(30);
    const [replaceVideo, setReplaceVideo] = useState(false);
    const [replacingVideo, setReplacingVideo] = useState(false);

    const getFrameRate = useCallback(() => frameRate, [frameRate]);
    const getResolution = useCallback(() => resolution, [resolution]);
    const getPeersConnected = useCallback(() => peersConnected, [peersConnected]);
    const getStream = useCallback(() => stream, [stream])

    useEffect(() => {
        console.log("stream mudou")
    }, [stream])

    useEffect(() => {
        if (!replaceVideo || replacingVideo) return;

        setReplacingVideo(true);
        setReplaceVideo(false);

        const prevStream = getStream();

        // Track[0] = user
        // Track[1] = device
        navigator.mediaDevices.getDisplayMedia(getDisplayMediaConstraints({ width: getResolution()[0], height: getResolution()[1], framerate: getFrameRate() }))
            .then(currentStream => {
                if (!prevStream) return;

                const newStream = new MediaStream();

                if (currentStream.getAudioTracks().length == 0) {
                    currentStream.addTrack(fakeAudio().getAudioTracks()[0]);
                }

                // add tracks to new stream
                [prevStream.getVideoTracks()[0],
                prevStream.getAudioTracks()[0],
                currentStream.getVideoTracks()[0],
                currentStream.getAudioTracks()[0]
                ].forEach(track => newStream.addTrack(track));

                prevStream.getAudioTracks()[1].stop();
                prevStream.getVideoTracks()[1].stop();

                const peers = getPeersConnected();

                Object.keys(peers).forEach(k => {
                    const { call } = peers[k];
                    call.close();
                    peers[k].call = peer.call(k, newStream);
                });

                setStream(newStream);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setReplacingVideo(false);
            });
    }, [replaceVideo, replacingVideo]);

    useEffect(() => {
        if (params) setRoomName(params.roomName);
    }, [params]);

    useEffect(() => {
        if (auth.user && params) {
            const initSocket = () => {
                socket = io(SOCKET_IO_ENDPOINT, { reconnection: true });
                socket.on("connected-in-room", () => {
                    if (params.isStreaming) getStream()
                });
                socket.on("room-name", (roomName: string) => {
                    params.roomName = roomName;
                    setRoomName(params.roomName);
                });
                socket.on("connect", () => {
                    setSocketError(false);
                });
                socket.on("error", (err) => {
                    console.error("error", err)
                    setSocketError(err)
                });
            }

            const initPeer = () => {
                const Peer = require("peerjs").default;

                peer = new Peer({
                    host: PEER_HOST,
                    port: PEER_PORT,
                    path: PEER_PATH
                });

                peer.on("open", (peerId: string) => {
                    setPeerError(false);

                    if (!params.isStreaming) {
                        socket.on("request-send-call", () => {
                            peer.on("call", call => {
                                call.on("stream", stream => {
                                    setStream(stream);
                                });
                                call.on("error", (err) => {
                                    console.error(err);
                                    setPeerError(err.message);
                                    showNotification("Ocorreu um erro com a Live", NotificationTypes.Error);
                                });
                                call.on("close", () => {
                                    peer.destroy();
                                    socket.close();
                                    showNotification("A live acabou", NotificationTypes.Info);
                                });
                                call.answer();
                            });
                            socket.emit("accept-requested-call");
                        });
                    }

                    socket.on("user-connected", function () {
                        socket.emit("get-users-in-room");
                    });

                    socket.on("users-in-room", (usersList: { [userId: string]: (IUserConnected & { roomId: string }) }) => {
                        if (auth.user) var { [auth.user.id]: me, ...usersList } = usersList;
                        setUsersConnected({ ...usersList });
                    });

                    socket.emit("join-room", params.roomId ?? ROOM, params.roomName, auth.user!.id, peer.id, params.isStreaming)
                });

                peer.on("error", (err) => {
                    console.error(err);
                    setPeerError(err.message);
                    if (peer.disconnected && !peer.destroyed) peer.reconnect();
                });
            }

            const getStream = () => {
                /* stream videoTrack[0] = user 
                 * stream videoTrack[1] = device
                */
                const newStream = new MediaStream();

                navigator.mediaDevices.getUserMedia(getUserMediaConstraints())
                    .then(currentStream => {
                        newStream.addTrack(currentStream.getVideoTracks()[0]);
                        newStream.addTrack(currentStream.getAudioTracks()[0]);
                    })
                    .catch(err => {
                        console.error(err);

                        const currentStream = fakeAudio();
                        currentStream.addTrack(fakeVideo());

                        newStream.addTrack(currentStream.getVideoTracks()[0]);
                        newStream.addTrack(currentStream.getAudioTracks()[0]);
                    })
                    .finally(() => {
                        navigator.mediaDevices.getDisplayMedia(getDisplayMediaConstraints({ width: resolution[0], height: resolution[1], framerate: frameRate }))
                            .then(currentStream => {
                                if (currentStream.getAudioTracks().length == 0) {
                                    currentStream.addTrack(fakeAudio().getAudioTracks()[0]);
                                }
                                newStream.addTrack(currentStream.getVideoTracks()[0]);
                                newStream.addTrack(currentStream.getAudioTracks()[0]);
                            })
                            .catch(err => {
                                console.error(err);

                                const currentStream = fakeAudio();
                                currentStream.addTrack(fakeVideo());

                                newStream.addTrack(currentStream.getVideoTracks()[0]);
                                newStream.addTrack(currentStream.getAudioTracks()[0]);
                            })
                            .finally(() => {
                                setStream(newStream);
                                setStreamerParameters(newStream);
                            });
                    });
            }

            const setStreamerParameters = (stream: MediaStream) => {
                socket.on("accept-requested-call", (data: IUserConnected) => {
                    const call = peer.call(data.peerId, stream, undefined);

                    setPeersConnected(oldPeers => ({ ...oldPeers, [data.peerId]: { call, socketId: data.socketId, user: data.user } }))

                    call.on("error", (err) => {
                        console.error(err);
                        showNotification("Não foi possível enviar a stream", NotificationTypes.Error);
                    });
                });

                socket.on("user-connected", function (data: IUserConnected) {
                    socket.emit("request-send-call", data.user.id);
                });

                socket.on("user-disconnected", function (peerId: string) {
                    const peers = getPeersConnected();

                    if (peers && peers[peerId]) {
                        peers[peerId].call.close();
                        let { [peerId]: peerToRemove, ...otherPeers } = peers;
                        setPeersConnected(otherPeers);
                    }
                    socket.emit("get-users-in-room");
                });
                socket.emit("get-users-in-room");
            }

            if (params) {
                initSocket();
                initPeer();
            }

            return () => {
                if (socket && params) {
                    socket.removeAllListeners();
                    socket.close();
                    socket = io("", undefined);

                    setStream((prevStream) => {
                        if (prevStream?.id) {
                            prevStream.getTracks().forEach(track => {
                                track.stop();
                                prevStream.removeTrack(track);
                            });
                        }
                        return null;
                    });

                    peer.destroy();
                    setParams(null);
                    setPeersConnected({});
                    setPeerError(false);
                    setSocketError(false);
                }
            }
        }
    }, [params])

    const fakeVideo = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext("2d")?.fillRect(0, 0, width, height);
        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    const fakeAudio = () => {
        const audioCtx = new window.AudioContext();
        const fakeAudio = audioCtx.createMediaStreamDestination();
        const currentStream = new MediaStream(fakeAudio.stream);
        return currentStream;
    };

    return (
        <SocketContext.Provider value={{
            socket,
            peer,
            stream,
            usersConnected,
            peerError,
            socketError,
            setParams,
            roomId: ROOM,
            roomName,
            setResolution,
            setFrameRate,
            resolution,
            frameRate,
            setReplaceVideo
        }}>
            {children}
        </SocketContext.Provider>
    )
}