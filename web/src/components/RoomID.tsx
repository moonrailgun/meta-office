import React from 'react';
import styled from 'styled-components';
import { useRTCClientStore } from '../rtc/store';

const Container = styled.div({
  position: 'absolute',
  left: 10,
  bottom: 10,
});

export const RoomId: React.FC = React.memo(() => {
  const { roomId } = useRTCClientStore();

  return (
    <Container>
      {roomId ? `当前房间号: ${roomId}` : '当前未加入任何房间'}
    </Container>
  );
});
RoomId.displayName = 'RoomId';
