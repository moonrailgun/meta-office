import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import { nanoid } from 'nanoid';

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

interface RoomSwitchProps {
  onJoinRoom: (roomId: string) => void;
}
export const RoomSwitch: React.FC<RoomSwitchProps> = React.memo((props) => {
  const [roomId, setRoomId] = useState(() => nanoid());

  // useEffect(() => {
  //   // 挂载时自动登录房间
  //   handleSwitchRoom();
  // }, []);

  const handleSwitchRoom = useCallback(() => {
    props.onJoinRoom(roomId);
  }, [roomId, props.onJoinRoom]);

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
        onChange={(e) => setRoomId(e.target.value)}
        onPressEnter={handleSwitchRoom}
      />
      <CopyButton onClick={handleCopy} />
    </div>
  );
});
RoomSwitch.displayName = 'RoomSwitch';
