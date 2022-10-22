import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import { nanoid } from 'nanoid';
import { useRTCClientStore } from '../rtc/store';
import { useGlobalContext } from '../context';

const RoomIdInput = styled(Input)({
  width: 200,
});

const CopyButton = styled(Button).attrs({
  type: 'default',
  shape: 'circle',
  icon: <CopyOutlined />,
  size: 'middle',
})({
  marginLeft: 4,
});

export const RoomSwitch: React.FC = React.memo(() => {
  const [roomId, setRoomId] = useState(() => 'jiaming');
  // const [roomId, setRoomId] = useState(() => nanoid(8));
  const { join } = useRTCClientStore();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useGlobalContext();

  useEffect(() => {
    // 挂载时自动登录房间
    handleSwitchRoom();
  }, []);

  const handleSwitchRoom = useCallback(async () => {
    setLoading(true);
    await join(`meta-office-${roomId}`, {
      video: false,
      audio: false,
      displayName: userInfo?.name ?? '',
      picture: userInfo?.avatar ?? '',
    });
    setLoading(false);
  }, [roomId]);

  const handleCopy = useCallback(() => {
    copy(roomId);

    message.success('房间号已经复制到剪切板, 快去分享给你的好友吧');
  }, [roomId]);

  return (
    <div>
      房间号:{' '}
      <RoomIdInput
        placeholder="请输入房间号"
        value={roomId}
        disabled={loading}
        onChange={(e) => setRoomId(e.target.value)}
        onPressEnter={handleSwitchRoom}
      />
      <CopyButton onClick={handleCopy} />
    </div>
  );
});
RoomSwitch.displayName = 'RoomSwitch';
