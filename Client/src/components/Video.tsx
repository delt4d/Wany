import { useState, useEffect, useRef } from "react";

interface IVideoProps {
  stream: MediaStream | null
  display?: boolean
  className?: string
  isStreaming: boolean
}

const Video = (props: IVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && props.stream) {
      const _stream = new MediaStream();

      if (props.display == true) {
        _stream.addTrack(props.stream.getVideoTracks()[1]);
        _stream.addTrack(props.stream.getAudioTracks()[1]);
      } else {
        _stream.addTrack(props.stream.getVideoTracks()[0]);
        _stream.addTrack(props.stream.getAudioTracks()[0]);
      }

      videoRef.current.srcObject = _stream;
    }

  }, [videoRef.current, props.stream]);

  return (
    <div
      className={props.className}
      style={{ background: "#222", width: "100%", height: "100%" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={!!props.isStreaming}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        controls={!!props.stream}
        controlsList={!props.isStreaming ? "" : "nodownload"}
      >
      </video>
    </div>
  );
};

export default Video;