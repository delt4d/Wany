import styles from "@styles/Stream.module.css";
import { useCallback, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import Video from "./Video";

interface IVideoContainer {
    stream: MediaStream | null
    onInitStream?: Function
    isStreaming?: boolean
}

const VideoContainer = ({ stream, onInitStream, isStreaming }: IVideoContainer) => {
    const initStream = () => {
        if (onInitStream) onInitStream();
    }

    const videoNULL = useCallback(() => {
        return stream == null ? " " + (isStreaming ? styles.VideoNULLStreaming : styles.VideoNULL) : "";
    }, [stream]);

    if (!isStreaming) {
        useEffect(() => {
            initStream();
        }, [onInitStream])
    }

    return (
        <div id={styles.VideoContainer}>
            <div onClick={initStream} className={`${styles.Video} ${styles.DeviceVideo}` + videoNULL()}>
                <Video stream={stream} isStreaming={!!isStreaming} display={true} />
            </div>

            <ChatContainer />

            {stream != null &&
                <div className={`${styles.Video} ${styles.UserVideo}`}>
                    <Video stream={stream} isStreaming={!!isStreaming} />
                </div>
            }
        </div>
    )
}

export default VideoContainer;