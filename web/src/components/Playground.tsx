import React, { memo, useRef } from 'react';
import { DefaultUserAvatar, MoveType } from './../const';
import { useMoveControl } from './../hooks/useMoveControl';
import { Message, Position } from './../type';
import cx from 'classnames';
import { Popover } from 'antd';
import { useGlobalContext } from './../context';
import styled from 'styled-components';

interface UserItemProps {
  avatar: string;
  position: Position;
  moveType: MoveType;
  active: boolean;
  message?: Message;
}

const UserrItemContainer = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-radius: 50%;

  &.active {
    border-color: greenyellow;
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const UserItem: React.FC<UserItemProps> = memo(
  ({ avatar, position: { x, y }, moveType, active, message }) => {
    console.log(moveType);

    return (
      <Popover
        placement="top"
        title={message?.time}
        content={message?.content}
        open={Boolean(message)}
        trigger={['hover']}
        key={`${x}${y}`}
        overlayInnerStyle={{ maxWidth: 200 }}
      >
        <UserrItemContainer
          className={cx({ active })}
          style={{
            left: x,
            top: y,
            transition:
              moveType === MoveType.Mouse ? 'all 0.3s ease-in-out' : undefined,
          }}
        >
          <Avatar src={avatar} />
        </UserrItemContainer>
      </Popover>
    );
  }
);

const PlaygroundContainer = styled.div`
  width: 800px;
  height: 500px;
  position: relative;
  border: 1px solid red;
  background-image: linear-gradient(
      90deg,
      rgba(60, 10, 30, 0.1) 3%,
      transparent 0
    ),
    linear-gradient(1turn, rgba(60, 10, 30, 0.1) 3%, transparent 0);
  background-size: 25px 25px;
  background-position: 50%;
  background-repeat: repeat;
`;

export const Playground: React.FC = memo(() => {
  const container = useRef(null);
  const { position, moveType } = useMoveControl(container);
  const { userInfo } = useGlobalContext();

  return (
    <PlaygroundContainer ref={container}>
      <UserItem
        avatar={userInfo?.avatar_middle || DefaultUserAvatar}
        position={position}
        moveType={moveType}
        active={true}
        message={{
          time: '2022/02/22 19:30:23',
          content:
            'this is last message this is last message this is last message this is last message this is last message ',
        }}
      />
    </PlaygroundContainer>
  );
});
