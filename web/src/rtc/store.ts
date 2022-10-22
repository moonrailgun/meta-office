import {
  TailchatMeetingClient,
  Peer,
  JoinOptions,
  VolumeWatcher,
  Volume,
} from 'tailchat-meeting-sdk';
import { nanoid } from 'nanoid';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { once } from 'lodash-es';
import { message } from 'antd';

export const peerId = nanoid(); // 实例唯一的id
const serviceUrl = process.env.TAILCHAT_MEETING_URL;
if (!serviceUrl) {
  console.error('env "TAILCHAT_MEETING_URL" is required');
}

interface RTCProduceState {
  enabled: boolean;
  mediaStream: MediaStream | null;
}

interface RTCClientState {
  roomId: string;
  produce: {
    webcam: RTCProduceState;
    mic: RTCProduceState;
    volume: Volume | null;
    volumeWatcher: VolumeWatcher | null;
  };
  peers: Peer[];
  peerUpdateRef: Record<string, number>; // 用于强制更新列表 <peerId, updateNum>
  join: (roomId: string, options: JoinOptions) => Promise<void>;
  getPeerMediaInfo: (peerId: string) => {
    webcamTrack: MediaStreamTrack | undefined;
    micTrack: MediaStreamTrack | undefined;
    volumeWatcher: VolumeWatcher | undefined;
  };
  switchWebcam: () => void;
  switchMic: () => void;
}

export const useRTCClientStore = create<
  RTCClientState,
  [['zustand/immer', never]]
>(
  immer((set, get) => {
    const client = new TailchatMeetingClient(
      String(process.env.TAILCHAT_MEETING_URL),
      peerId
    );

    const updatePeerRef = (peerId: string) => {
      // 强制更新一下
      set((state) => {
        if (!state.peerUpdateRef[peerId]) {
          state.peerUpdateRef[peerId] = 0;
        }

        state.peerUpdateRef[peerId] += 1;
      });
    };

    const listenPeersUpdate = once(() => {
      client.onPeersUpdate((peers) => {
        set({
          peers: [...peers],
        });
      });

      client.onPeerConsumerUpdate((peerId, consumer) => {
        // 强制更新一下
        updatePeerRef(peerId);
      });
    });

    client.onWebcamProduce((webcamProducer) => {
      set((state) => {
        if (webcamProducer.track) {
          state.produce.webcam = {
            enabled: true,
            mediaStream: new MediaStream([webcamProducer.track]),
          };
        }
      });
      updatePeerRef(peerId);
    });

    client.onWebcamClose(() => {
      set((state) => {
        state.produce.webcam = {
          enabled: false,
          mediaStream: null,
        };
      });
      updatePeerRef(peerId);
    });

    client.onMicProduce((micProducer) => {
      set((state) => {
        if (micProducer.track) {
          state.produce.mic = {
            enabled: true,
            mediaStream: new MediaStream([micProducer.track]),
          };
        }
      });

      if ('volumeWatcher' in micProducer.appData) {
        set((state) => {
          state.produce.volumeWatcher = micProducer.appData
            .volumeWatcher as VolumeWatcher;
        });
        (micProducer.appData.volumeWatcher as VolumeWatcher).on(
          'volumeChange',
          (volume) => {
            set((state) => {
              state.produce.volume = volume;
            });
          }
        );
      }

      updatePeerRef(peerId);
    });

    client.onMicClose(() => {
      set((state) => {
        state.produce.mic = {
          enabled: false,
          mediaStream: null,
        };
        state.produce.volume = null;
        state.produce.volumeWatcher = null;
      });

      updatePeerRef(peerId);
    });

    return {
      roomId: '',
      produce: {
        webcam: {
          enabled: false,
          mediaStream: null,
        },
        mic: {
          enabled: false,
          mediaStream: null,
        },
        volume: null,
        volumeWatcher: null,
      },
      peers: [],
      peerUpdateRef: {},
      async join(roomId, options) {
        try {
          if (client.roomId) {
            client.close();
          }

          await client.join(roomId, options);

          console.log('join room success', {
            roomId,
            options,
          });
          message.success(`加入房间 [${roomId}] 成功`);

          set({
            roomId,
            peers: client.room?.peers ?? [],
          });

          listenPeersUpdate();
        } catch (err) {
          message.error('Join room failed' + String(err));
          console.error('join room failed', err);
          throw err;
        }
      },
      getPeerMediaInfo(targetPeerId: string) {
        if (peerId === targetPeerId) {
          // 是自己
          const produce = get().produce;

          return {
            webcamTrack: produce.webcam.mediaStream?.getVideoTracks()[0],
            micTrack: produce.mic.mediaStream?.getAudioTracks()[0],
            volumeWatcher: produce.volumeWatcher,
          };
        } else {
          const { webcamConsumer, micConsumer } =
            client.getConsumersByPeerId(targetPeerId);

          return {
            webcamTrack: webcamConsumer?.track,
            micTrack: micConsumer?.track,
            volumeWatcher: micConsumer?.appData.volumeWatcher,
          };
        }
      },
      switchWebcam() {
        if (client.webcamEnabled) {
          client.disableWebcam();
        } else {
          client.enableWebcam();
        }
      },
      switchMic() {
        if (client.micEnabled) {
          client.disableMic();
        } else {
          client.enableMic();
        }
      },
    } as RTCClientState;
  })
);
