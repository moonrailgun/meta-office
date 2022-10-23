import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { endpoint } from '../api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Position, RoomMediaInfo, RoomUserInfo, UserInfo } from '../type';
import { RoomDataType, SendHeartbeatTime } from '../const';
import { useEvent } from './useEvent';
import dayjs from 'dayjs';
import { peerId } from '../rtc/store';

export function useRoomData({
  roomId,
  userInfo: { name, avatar, id },
}: {
  roomId: string;
  userInfo: UserInfo;
}) {
  const prevProvider = useRef<SocketIOProvider | null>(null);
  const { doc, provider } = useMemo(() => {
    if (prevProvider.current) {
      prevProvider.current.destroy();
      prevProvider.current = null;
    }
    const doc = new Doc();
    const provider = new SocketIOProvider(endpoint, roomId, doc, {
      auth: { roomId, userId: id },
    });

    prevProvider.current = provider;

    return { doc, provider };
  }, [roomId, id]);
  const heartbeatDisposser = useRef<ReturnType<typeof setInterval>>();

  const roomUserDoc = useMemo(
    () => doc.getMap<RoomUserInfo>(RoomDataType.User),
    [doc]
  );
  const [roomUserInfo, setRoomUserInfo] = useState<
    Record<string, RoomUserInfo>
  >({});

  const allUsers = useMemo(() => Object.values(roomUserInfo), [roomUserInfo]);
  const currentUser = useMemo(() => roomUserInfo[id], [roomUserInfo, id]);

  useEffect(() => {
    const fn = () => {
      setRoomUserInfo(roomUserDoc.toJSON());
    };

    roomUserDoc.observe(fn);

    return () => {
      roomUserDoc.unobserve(fn);
    };
  }, [roomUserDoc]);

  const roomMediaDoc = doc.getMap<RoomMediaInfo>(RoomDataType.Media);
  const [roomMediaInfo, setRoomMediaInfo] = useState<
    Record<string, RoomMediaInfo>
  >({});
  const allMedia = useMemo(() => Object.values(roomMediaInfo), [roomMediaInfo]);

  useEffect(() => {
    const fn = () => {
      setRoomMediaInfo(roomMediaDoc.toJSON());
    };
    roomMediaDoc.observe(fn);

    return () => {
      roomMediaDoc.unobserve(fn);
    };
  }, [roomMediaDoc]);

  const init = useEvent(() => {
    provider.on(
      'status',
      ({ status }: { status: 'connected' | 'disconnected' }) => {
        console.log(`socket provider ${status}`);

        const self = roomUserDoc.get(id);

        if (!self) {
          roomUserDoc.set(id, {
            id,
            name,
            avatar,
            position: { x: 0, y: 0 },
            lastHeartbeat: dayjs().unix(),
            peerId,
          });
        }
      }
    );
  });

  // 定时发送心跳 表示是否还活跃
  const sendHeartbeat = useEvent(() => {
    roomUserDoc.set(id, {
      ...currentUser,
      lastHeartbeat: dayjs().unix(),
    });
  });

  const sendMessage = useEvent((content: string) => {
    roomUserDoc.set(id, {
      ...currentUser,
      lastMessage: {
        time: dayjs().unix(),
        content,
      },
    });
  });

  const updatePosition = useEvent((position: Position) => {
    roomUserDoc.set(id, {
      ...currentUser,
      position,
    });
  });

  const addMedia = useEvent((media: RoomMediaInfo) => {
    roomMediaDoc.set(media.id, media);
  });

  const delMedia = useEvent((id: string) => {
    roomMediaDoc.delete(id);
  });

  const clearDisposser = useEvent(() => {
    if (heartbeatDisposser.current) {
      clearInterval(heartbeatDisposser.current);
    }
  });

  useEffect(() => {
    init();

    clearDisposser();

    heartbeatDisposser.current = setInterval(() => {
      sendHeartbeat();
    }, SendHeartbeatTime);

    return () => {
      clearDisposser();
    };
  }, [roomId]);

  return {
    allUsers,
    allMedia,
    currentUser,
    sendMessage,
    updatePosition,

    addMedia,
    delMedia,
  };
}
