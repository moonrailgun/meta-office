import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { endpoint } from '../api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Position, RoomMediaInfo, RoomUserInfo, UserInfo } from '../type';
import {
  EmptyRoomUserInfo,
  PositionType,
  RoomDataType,
  SendHeartbeatTime,
} from '../const';
import { useEvent } from './useEvent';
import dayjs from 'dayjs';
import { peerId } from '../rtc/store';
import { PositionTransformer } from './usePlayground';

export function useRoomData({
  roomId,
  userInfo,
  positionTransfromer,
}: {
  roomId: string;
  userInfo?: UserInfo;
  positionTransfromer: PositionTransformer;
}) {
  const prevProvider = useRef<SocketIOProvider | null>(null);
  const doc = useMemo(() => new Doc(), [roomId, userInfo?.id]);

  // 初始化Socket
  const init = useEvent(() => {
    const { avatar, name, id } = userInfo!;

    // 销毁已有provider
    if (prevProvider.current) {
      prevProvider.current.destroy();
      prevProvider.current = null;
    }

    const provider = new SocketIOProvider(endpoint, roomId, doc, {
      auth: { roomId, userId: id },
    });

    prevProvider.current = provider;

    provider.on(
      'status',
      ({ status }: { status: 'connected' | 'disconnected' }) => {
        console.log(`socket provider ${status}`);

        const self = roomUserDoc.get(id);

        // 初始化用户数据
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

  // 心跳Disposser
  const heartbeatDisposser = useRef<ReturnType<typeof setInterval>>();

  // 清理自动发送心跳
  const clearDisposser = useEvent(() => {
    if (heartbeatDisposser.current) {
      clearInterval(heartbeatDisposser.current);
    }
  });

  // 初始化
  useEffect(() => {
    // 未登录 不实例化Socket
    if (!userInfo) {
      return;
    }

    init();

    // 定期发送心跳 表示活跃
    heartbeatDisposser.current = setInterval(() => {
      sendHeartbeat();
    }, SendHeartbeatTime);

    return () => {
      clearDisposser();
    };
  }, [roomId, userInfo?.id]);

  // User DOC
  const roomUserDoc = useMemo(
    () => doc.getMap<RoomUserInfo>(RoomDataType.User),
    [doc]
  );
  // 原始数据 不要直接使用 使用allUsers
  const [roomUserInfo, setRoomUserInfo] = useState<
    Record<string, RoomUserInfo>
  >({});

  // User Info State
  const allUsers = useMemo<RoomUserInfo[]>(() => {
    return Object.values(roomUserInfo).map((u) => ({
      ...u,
      // 相对坐标转为绝对坐标
      position: positionTransfromer(u.position, PositionType.Absolute),
    }));
  }, [roomUserInfo, positionTransfromer]);
  const currentUser = useMemo(
    () => allUsers.find((u) => u.id === userInfo?.id) || EmptyRoomUserInfo,
    [allUsers, userInfo?.id]
  );

  // 监听User Doc变化
  useEffect(() => {
    const fn = () => {
      setRoomUserInfo(roomUserDoc.toJSON());
    };

    roomUserDoc.observe(fn);

    return () => {
      roomUserDoc.unobserve(fn);
    };
  }, [roomUserDoc]);

  // Media DOC
  const roomMediaDoc = doc.getMap<RoomMediaInfo>(RoomDataType.Media);
  // 原始数据 不要直接使用 使用allMedia
  const [roomMediaInfo, setRoomMediaInfo] = useState<
    Record<string, RoomMediaInfo>
  >({});

  // Media Info State
  const allMedia = useMemo<RoomMediaInfo[]>(
    () =>
      Object.values(roomMediaInfo).map((m) => ({
        ...m,
        position: positionTransfromer(m.position, PositionType.Absolute),
      })),
    [roomMediaInfo, positionTransfromer]
  );

  // 监听Media Doc变化
  useEffect(() => {
    const fn = () => {
      setRoomMediaInfo(roomMediaDoc.toJSON());
    };
    roomMediaDoc.observe(fn);

    return () => {
      roomMediaDoc.unobserve(fn);
    };
  }, [roomMediaDoc]);

  const updateUserInfo = useEvent((user: RoomUserInfo) => {
    if (!userInfo) return;

    roomUserDoc.set(userInfo.id, {
      ...user,
      // 位置转为相对位置
      position: positionTransfromer(user.position, PositionType.Relative),
    });
  });

  // 定时发送心跳 表示是否还活跃
  const sendHeartbeat = useEvent(() => {
    updateUserInfo({
      ...currentUser,
      lastHeartbeat: dayjs().unix(),
    });
  });

  const sendMessage = useEvent((content: string) => {
    updateUserInfo({
      ...currentUser,
      lastMessage: {
        time: dayjs().unix(),
        content,
      },
    });
  });

  const updatePosition = useEvent((position: Position) => {
    updateUserInfo({
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
