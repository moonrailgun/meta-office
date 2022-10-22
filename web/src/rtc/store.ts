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
  };
  peers: Peer[];
  peerUpdateRef: Record<string, number>; // 用于强制更新列表 <peerId, updateNum>
  join: (roomId: string, options: JoinOptions) => Promise<void>;
  getPeerMediaInfo: (peerId: string) => {
    webcamTrack: MediaStreamTrack | undefined;
    micTrack: MediaStreamTrack | undefined;
    volumeWatcher: VolumeWatcher | undefined;
  };
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

    const listenPeersUpdate = once(() => {
      client.onPeersUpdate((peers) => {
        set({
          peers: [...peers],
        });
      });

      client.onPeerConsumerUpdate((peerId, consumer) => {
        // 强制更新一下
        set((state) => {
          if (!state.peerUpdateRef[peerId]) {
            state.peerUpdateRef[peerId] = 0;
          }

          state.peerUpdateRef[peerId] += 1;
        });
      });
    });

    client.onWebcamProduce((webcamProducer) => {
      set((state: RTCClientState) => {
        if (webcamProducer.track) {
          state.produce.webcam = {
            enabled: true,
            mediaStream: new MediaStream([webcamProducer.track]),
          };
        }
      });
    });

    client.onWebcamClose(() => {
      set((state: RTCClientState) => {
        state.produce.webcam = {
          enabled: false,
          mediaStream: null,
        };
      });
    });

    client.onMicProduce((micProducer) => {
      set((state: RTCClientState) => {
        if (micProducer.track) {
          state.produce.mic = {
            enabled: true,
            mediaStream: new MediaStream([micProducer.track]),
          };
        }
      });

      if ('volumeWatcher' in micProducer.appData) {
        (micProducer.appData.volumeWatcher as VolumeWatcher).on(
          'volumeChange',
          (volume) => {
            set((state: RTCClientState) => {
              state.produce.volume = volume;
            });
          }
        );
      }
    });

    client.onMicClose(() => {
      set((state: RTCClientState) => {
        state.produce.mic = {
          enabled: false,
          mediaStream: null,
        };
      });
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
      },
      peers: [],
      peerUpdateRef: {},
      async join(roomId, options) {
        try {
          const joinP = ((window as any).joinP = client.join(roomId, options));
          await Promise.resolve(joinP);

          console.log('join room success', {
            roomId,
            options,
          });
          message.success(`加入房间 ${roomId} 成功`);

          set({
            roomId,
            peers: client.room?.peers ?? [],
          });

          listenPeersUpdate();
        } catch (err) {
          console.error('join room failed', err);
          throw err;
        }
      },
      getPeerMediaInfo(peerId: string) {
        const { webcamConsumer, micConsumer } =
          client.getConsumersByPeerId(peerId);

        return {
          webcamTrack: webcamConsumer?.track,
          micTrack: micConsumer?.track,
          volumeWatcher: micConsumer?.appData.volumeWatcher,
        };
      },
    } as RTCClientState;
  })
);
