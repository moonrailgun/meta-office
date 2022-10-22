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

const peerId = nanoid(); // 实例唯一的id
const serviceUrl = process.env.TAILCHAT_MEETING_URL;
if (!serviceUrl) {
  console.error('env "TAILCHAT_MEETING_URL" is required');
}

interface RTCProduceState {
  enabled: boolean;
  mediaStream: MediaStream | null;
}

interface RTCClientState {
  client: TailchatMeetingClient;
  produce: {
    webcam: RTCProduceState;
    mic: RTCProduceState;
    volume: Volume | null;
  };
  peers: Peer[];
  join: (roomId: string, options: JoinOptions) => Promise<void>;
  getPeerMediaTracks: (peerId: string) => {
    webcamTrack: MediaStreamTrack | undefined;
    micTrack: MediaStreamTrack | undefined;
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
          peers,
        });
      });

      // client.onPeerConsumerUpdate((peerId, consumer) => {
      //   // 强制更新一下
      //   set({
      //     peers: [...get().peers],
      //   });
      // });
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
      client,
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
      async join(roomId, options) {
        await client.join(roomId, options);

        set({
          peers: client.room?.peers ?? [],
        });

        listenPeersUpdate();
      },
      getPeerMediaTracks(peerId: string) {
        const { webcamConsumer, micConsumer } =
          client.getConsumersByPeerId(peerId);

        return {
          webcamTrack: webcamConsumer?.track,
          micTrack: micConsumer?.track,
        };
      },
    };
  })
);
