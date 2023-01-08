import { NextPage } from "next";
import styles from "@styles/Stream.module.css";
import { NotificationTypes, showNotification } from "@helpers/notifications";
import { User } from "@api";
import { useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@contexts/auth";
import { SocketContext } from "@contexts/socket";
import { useRouter } from "next/router";
import Video from "@components/Video";
import VideoContainer from "@components/VideoContainer";
import ChatContainer from "@components/ChatContainer";

const Room: NextPage = () => {
    const auth = useAuth();
    const router = useRouter();

    const [room, setRoom] = useState("");
    const [init, setInit] = useState(false);
    const [canInit, setCanInit] = useState(false);
    const { roomName, peer, peerError, setParams, socket, socketError, stream, usersConnected } = useContext(SocketContext);

    const getCanInit = useCallback(() => canInit, [canInit]);

    const roomDoesNotExist = () => {
        const sectionStyle = {
            width: "100vw",
            height: "100vh",
            display: "grid",
            placeItems: "center",
        }

        return (
            <section style={sectionStyle}>
                <h1>Room does not exist</h1>
            </section>
        )
    }

    useEffect(() => {
        setInit(true);
        setParams({ isStreaming: false, roomName: `Watching ${room}`, roomId: `${room}` });
    }, [canInit, init, auth.user, room]);

    useEffect(() => {
        if (socketError) showNotification(socketError, NotificationTypes.Error);
    }, [socketError]);

    useEffect(() => {
        if (peerError) showNotification(peerError, NotificationTypes.Error);
    }, [peerError]);

    useEffect(() => {
        document.title = roomName;
    }, [roomName]);

    useEffect(() => {
        if (auth.finished && !auth.user) {
            showNotification("Você precisa se logar para assistir a streaming", NotificationTypes.Error);
        }
    }, [auth.finished]);

    useEffect(() => {
        const { room: ROOM } = router.query;
        setRoom(`${ROOM}`);
    }, [router.query])

    return (
        <section style={{ marginTop: "12vh" }} id={styles.StreamContainer}>
            <VideoContainer stream={stream} onInitStream={() => setCanInit(true)} />
        </section>
    )
}

export default Room