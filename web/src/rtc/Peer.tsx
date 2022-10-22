import React, { useEffect, useRef, useState } from 'react';
import { useRTCClientStore } from './store';

interface PeerProps {
  peerId: string;

  /**
   * 声音比例
   */
  volume: number;
}

/**
 * RTC 渲染组件
 */
export const Peer: React.FC<PeerProps> = React.memo((props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayWebcam, setDisplayWebcam] = useState(false);
  const { getPeerMediaTracks } = useRTCClientStore();

  useEffect(() => {
    if (!videoRef.current || !audioRef.current) {
      return;
    }

    const { webcamTrack, micTrack } = getPeerMediaTracks(props.peerId);

    if (webcamTrack) {
      setDisplayWebcam(true);
      videoRef.current.srcObject = new MediaStream([webcamTrack]);
      videoRef.current.play();
    }

    if (micTrack) {
      audioRef.current.srcObject = new MediaStream([micTrack]);
      audioRef.current.play();
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = props.volume;
  }, [props.volume]);

  return (
    <div>
      {displayWebcam && <video ref={videoRef} autoPlay={true} />}

      <audio ref={audioRef} autoPlay={true} style={{ display: 'none' }} />
    </div>
  );
});
Peer.displayName = 'Peer';
