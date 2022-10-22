import React, { useEffect, useRef, useState } from 'react';
import { useRTCClientStore } from './store';

interface PeerProps {
  peerId: string;

  /**
   * 声音比例
   *
   * 取值为 0 到 1 的双精度值。0 为静音，1 为音量最大时的值。
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
  const { getPeerMediaInfo, peerUpdateRef } = useRTCClientStore();
  const [currentVolumeLevel, setCurrentVolumeLevel] = useState(0);

  useEffect(() => {
    const { webcamTrack, micTrack, volumeWatcher } = getPeerMediaInfo(
      props.peerId
    );

    if (webcamTrack && videoRef.current) {
      setDisplayWebcam(true);
      videoRef.current.srcObject = new MediaStream([webcamTrack]);
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    }

    if (micTrack && audioRef.current) {
      audioRef.current.srcObject = new MediaStream([micTrack]);
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }

    if (volumeWatcher) {
      volumeWatcher.on('volumeChange', ({ scaledVolume }) => {
        setCurrentVolumeLevel(scaledVolume);
      });
    }
  }, [peerUpdateRef[props.peerId]]);

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

      <div>音量等级: {currentVolumeLevel}</div>
    </div>
  );
});
Peer.displayName = 'Peer';
