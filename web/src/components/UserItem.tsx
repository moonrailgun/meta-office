import React, { useMemo, useState } from 'react';
import { RoomUserInfo } from '../type';
import dayjs from 'dayjs';
import styled from 'styled-components';
import cx from 'classnames';
import { Peer } from '../rtc/Peer';

const UserItemContainer = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-radius: 50%;
  z-index: 5;

  &.active {
    border-color: greenyellow;
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const ExtraContainer = styled.div`
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MessageBox = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  min-width: 100px;
  white-space: nowrap;

  span {
    color: #999;
  }
`;

const PeerContainer = styled.div`
  margin-bottom: 4px;
`;

const UserName = styled.div`
  text-align: center;
  font-size: 10px;
  white-space: no-wrap;
`;

interface UserItemProps {
  roomUser: RoomUserInfo;
  volume: number;
}
export const UserItem: React.FC<UserItemProps> = React.memo(
  ({ roomUser, volume }) => {
    const { name, avatar, position, lastMessage, peerId } = roomUser;
    const { x = 0, y = 0 } = position || { x: 0, y: 0 };
    const [active, setActive] = useState(false);
    const lastMessageTime = useMemo(
      () => dayjs.unix(lastMessage?.time || 0),
      [lastMessage]
    );
    const showLastMessage = useMemo(() => {
      if (!lastMessage) return false;

      // 只显示五分钟内的消息
      return dayjs().unix() - lastMessage?.time < 1000 * 60 * 5;
    }, [lastMessage]);

    return (
      <UserItemContainer
        className={cx({ active })}
        style={{
          left: x,
          top: y,
        }}
      >
        <ExtraContainer>
          <PeerContainer>
            {peerId && (
              <Peer
                peerId={peerId}
                volume={volume}
                onVolumeLevelUpdate={(level) => {
                  level >= 2 ? setActive(true) : setActive(false);
                }}
              />
            )}
          </PeerContainer>

          {showLastMessage && (
            <MessageBox>
              <span>{lastMessageTime.format('HH:mm')} </span>
              {lastMessage?.content}
            </MessageBox>
          )}
        </ExtraContainer>
        <Avatar src={avatar} />
        <UserName>{name}</UserName>
      </UserItemContainer>
    );
  }
);
UserItem.displayName = 'UserItem';
