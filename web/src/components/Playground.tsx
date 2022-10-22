import React, { memo, useRef } from 'react';
import { PositionType } from './../const';
import { useMoveControl } from './../hooks/useMoveControl';
import cx from 'classnames';
import { useGlobalContext } from './../context';
import styled from 'styled-components';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { UserItem } from './UserItem';
import { MediaItem } from './MediaItem';

const PlaygroundContainer = styled.div`
  width: 100%;
  height: calc(100vh - 46px);
  overflow: hidden;
  position: relative;
  background-image: linear-gradient(
      90deg,
      rgba(60, 10, 30, 0.1) 3%,
      transparent 0
    ),
    linear-gradient(1turn, rgba(60, 10, 30, 0.1) 3%, transparent 0);
  background-size: 25px 25px;
  background-position: 50%;
  background-repeat: repeat;

  > * {
    transition: all 0.3s ease-in-out;
  }

  &.inKeyboardMove > * {
    transition: all 0.1s ease-in-out;
  }
`;

export const Playground: React.FC = memo(() => {
  const containerRef = useRef(null);
  const {
    roomDataContext: { currentUser, allUsers, allMedia, updatePosition },
  } = useGlobalContext();

  const { positionTransformer, inKeyboardMove } = useMoveControl({
    containerRef,
    onPositionChange: updatePosition,
    position: currentUser?.position,
  });

  const { show } = useContextMenu();

  return (
    <PlaygroundContainer
      className={cx({ inKeyboardMove })}
      ref={containerRef}
      onContextMenu={show}
    >
      {allUsers.map((roomUser) => (
        <UserItem
          key={roomUser.id}
          roomUser={{
            ...roomUser,
            position: positionTransformer(
              roomUser.position,
              PositionType.Absolute
            ),
          }}
        />
      ))}

      {allMedia.map((roomMedia) => (
        <MediaItem
          key={roomMedia.id}
          roomMedia={{
            ...roomMedia,
            position: positionTransformer(
              roomMedia.position,
              PositionType.Absolute
            ),
          }}
        />
      ))}

      <ContextMenu positionTransformer={positionTransformer} />
    </PlaygroundContainer>
  );
});
