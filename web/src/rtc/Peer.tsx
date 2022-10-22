import { Badge } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRTCClientStore } from './store';

const Root = styled.div({
  borderRadius: 10,
  fontSize: 12,
  width: 90,
  height: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',

  video: {
    width: '100%',
  },
});

interface PeerProps {
  peerId: string;

  /**
   * 声音比例
   *
   * 取值为 0 到 1 的双精度值。0 为静音，1 为音量最大时的值。
   */
  volume: number;

  /**
   * 0-10
   */
  onVolumeLevelUpdate?: (volumeLevel: number) => void;
}

/**
 * RTC 渲染组件
 */
export const Peer: React.FC<PeerProps> = React.memo((props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayWebcam, setDisplayWebcam] = useState(false);
  const { getPeerMediaInfo, peerUpdateRef, peers } = useRTCClientStore();
  const [currentVolumeLevel, setCurrentVolumeLevel] = useState(0);
  const peerId = props.peerId;

  useEffect(() => {
    const { webcamTrack, micTrack, volumeWatcher } = getPeerMediaInfo(peerId);
    console.log({ webcamTrack, micTrack, volumeWatcher });

    if (webcamTrack && videoRef.current) {
      setDisplayWebcam(true);
      videoRef.current.srcObject = new MediaStream([webcamTrack]);
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    } else {
      setDisplayWebcam(false);
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
    } else {
      setCurrentVolumeLevel(0);
    }
  }, [peerUpdateRef[peerId]]);

  useEffect(() => {
    if (typeof props.onVolumeLevelUpdate === 'function') {
      props.onVolumeLevelUpdate(currentVolumeLevel);
    }
  }, [currentVolumeLevel]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = props.volume;
  }, [props.volume]);

  if (!peers.find((peer) => peer.id !== peerId)) {
    return <Badge color="red" />;
  }

  return (
    <Root style={{ display: displayWebcam ? 'block' : 'none' }}>
      <video ref={videoRef} autoPlay={true} />

      <audio ref={audioRef} autoPlay={true} style={{ display: 'none' }} />
    </Root>
  );
});
Peer.displayName = 'Peer';
