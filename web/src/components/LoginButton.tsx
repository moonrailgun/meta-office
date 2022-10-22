import { Button } from 'antd';
import React, { memo } from 'react';
import { useGlobalContext } from './../context';

export const LoginButton: React.FC = memo(() => {
  const { login } = useGlobalContext();

  return (
    <Button type="primary" onClick={login}>
      飞书授权登录
    </Button>
  );
});
LoginButton.displayName = 'LoginButton';
