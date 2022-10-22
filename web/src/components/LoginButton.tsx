import { Button } from 'antd';
import React, { memo } from 'react';
import { useGlobalContext } from './../context';

export const LoginButton: React.FC = memo(() => {
  const { login, userInfo } = useGlobalContext();

  if (userInfo) {
    return null;
  }

  return (
    <Button type="primary" onClick={login}>
      飞书授权登录
    </Button>
  );
});
