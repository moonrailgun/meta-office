import React, { memo } from 'react';
import { useGlobalContext } from './../context';
import { useRTCClientStore } from './../rtc/store';
import { RoomSwitch } from './RoomSwitch';
import { UserAvatar } from './UserAvatar';
import styled from 'styled-components';
import { RTCController } from './RTCController';
import { Divider } from 'antd';

const HeaderContainer = styled.div`
  width: 100%;
  height: 46px;
  border-bottom: 1px solid rgb(0 0 0 / 15%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 10px;
  flex-shrink: 0;
`;

const LeftContainer = styled.div`
  display: flex;

  > * {
    margin-right: 10px;
  }
`;

export const Header: React.FC = memo(() => {
  return (
    <HeaderContainer>
      <LeftContainer>
        <RoomSwitch />

        <Divider type="vertical" style={{ height: 32 }} />

        <RTCController />
      </LeftContainer>

      <UserAvatar />
    </HeaderContainer>
  );
});
