import React, { memo } from 'react';
import { useGlobalContext } from './../context';
import { DefaultUserAvatar } from './../const';
import styled from 'styled-components';

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

export const UserAvatar: React.FC = memo(() => {
  const { userInfo } = useGlobalContext();

  return <Avatar src={userInfo?.avatar_middle || DefaultUserAvatar} />;
});
