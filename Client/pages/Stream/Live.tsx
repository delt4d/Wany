import { NextPage } from "next";
import { SocketContext } from "@contexts/socket";
import styles from "@styles/Stream.module.css";
import { useContext, useEffect, useState } from "react";
import VideoContainer from "@components/VideoContainer";
import { NotificationTypes, showNotification } from "@helpers/notifications";
import VideoContainerConfiguration from "@components/VideoContainerConfiguration";

const Stream: NextPage = () => {
    const [init, setInit] = useState(false);
    const [canInit, setCanInit] = useState(false);
    const { roomId, peer, peerError, setParams, setReplaceVideo, socket, socketError, stream, usersConnected } = useContext(SocketContext);
    const [room, setRoom] = useState("");

    useEffect(() => {
        if (socketError) showNotification(socketError, NotificationTypes.Error);
    }, [socketError]);

    useEffect(() => {
        if (peerError) showNotification(peerError, NotificationTypes.Error);
    }, [peerError]);

    useEffect(() => {
        setCanInit(true);
    }, []);

    const startLive = () => {
        if (canInit) {
            const roomName = `Live ${roomId ?? ""}`;
            setRoom(`${window.location.origin}/Stream/Rooms/${roomId}`);
            setInit(true);
            setParams({ isStreaming: true, roomName });

            document.title = roomName;

            window.onbeforeunload = function () {
                return 'Tem certeza que deseja sair?';
            };
        }
    }

    return (
        <>
            <VideoContainerConfiguration />

            <section style={{ marginTop: !stream ? "auto" : "14vh" }} id={styles.StreamContainer}>
                {stream && <>
                    <input id={styles.RoomLink} type="text" value={room} placeholder={"Link da Sala"} readOnly></input>
                    <input style={{ marginLeft: "4px", padding: "4px", color: "#fff", background: "var(--primary-color)" }} onClick={() => setReplaceVideo(true)} type="button" value="Mudar transmissão" />
                </>}

                <VideoContainer isStreaming={true} stream={stream} onInitStream={startLive} />
            </section>
        </>
    )
}

export default Stream