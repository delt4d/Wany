import { SocketContext } from "@contexts/socket";
import { useContext, useState } from "react";

import styles from "@styles/VideoContainerConfiguration.module.css";

const VIDEO_RESOLUTIONS = {
    '320p': [320, 240],
    '640p': [640, 480],
    'HD': [1280, 720],
    'Full HD': [1920, 1080],
    '2k': [2048, 1080],
    '4k': [3840, 2160],
    '8k': [7680, 4320]
}

const FRAME_RATES = {
    '24fps': 24,
    '30fps': 30,
    '60fps': 60,
    '120fps': 120,
    '240fps': 240
}


interface IVideoContainerConfigurationProps {
}

const VideoContainerConfiguration = (props: IVideoContainerConfigurationProps) => {
    const {
        setResolution,
        setFrameRate,
        resolution,
        frameRate
    } = useContext(SocketContext);

    const renderVideoResolutions = () =>
        Object.entries(VIDEO_RESOLUTIONS).map(([name, resolutionValue], index) => {
            const selected =
                resolutionValue.toString() == resolution.toString() ?
                    styles.BlockSelected : "";

            return (
                <div key={index} className={`${styles.Block} ${selected}`} onClick={() => setResolution(resolutionValue)}>
                    <span><strong>{name}</strong></span>
                    <span>{resolutionValue[0]}p{resolutionValue[1]}</span>
                </div>)
        })

    const renderVideoFPS = () =>
        Object.entries(FRAME_RATES).map(([name, fps], index) => {
            const selected = fps.toString() == frameRate.toString() ?
                styles.BlockSelected : "";
            return (
                <div key={index} className={`${styles.Block} ${selected}`} onClick={() => setFrameRate(fps)}>
                    <span>{name}</span>
                </div>
            )
        })

    return (
        <section className={styles.Container}>
            <h6 className={styles.Title}>Resolução</h6>

            <div className={styles.Container_Resolution}>
                {renderVideoResolutions()}
            </div>

            <h6 className={styles.Title}>FPS</h6>

            <div className={styles.Container_FPS}>
                {renderVideoFPS()}
            </div>
        </section>
    )
}

export default VideoContainerConfiguration;