import { Button, Space } from 'antd';
import React, { memo } from 'react';
import { useGlobalContext } from './../context';

export const LoginButton: React.FC = memo(() => {
  const { login, fakeLogin } = useGlobalContext();

  return (
    <Space>
      <Button type="primary" onClick={login}>
        飞书授权登录
      </Button>

      <Button type="primary" onClick={fakeLogin}>
        测试账号
      </Button>
    </Space>
  );
});
LoginButton.displayName = 'LoginButton';
