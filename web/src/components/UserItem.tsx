import React, { useState } from 'react';
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
  background-color: rgba(0, 0, 0, 0.2);
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
}
export const UserItem: React.FC<UserItemProps> = React.memo((props) => {
  const { name, avatar, position, lastMessage, peerId } = props.roomUser;
  const { x = 0, y = 0 } = position;
  const [active, setActive] = useState(false);

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
              volume={1}
              onVolumeLevelUpdate={(level) =>
                level >= 2 ? setActive(true) : setActive(false)
              }
            />
          )}
        </PeerContainer>

        {Boolean(lastMessage) && (
          <MessageBox>
            <span>{dayjs.unix(lastMessage?.time || 0).format('HH:mm')} </span>
            {lastMessage?.content}
          </MessageBox>
        )}
      </ExtraContainer>
      <Avatar src={avatar} />
      <UserName>{name}</UserName>
    </UserItemContainer>
  );
});
UserItem.displayName = 'UserItem';
