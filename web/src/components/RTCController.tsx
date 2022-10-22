import React from 'react';
import { AudioOutlined, CameraOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useRTCClientStore } from '../rtc/store';

export const RTCController: React.FC = React.memo(() => {
  const { produce } = useRTCClientStore();

  return (
    <Space>
      <Button
        type={produce.webcam.enabled ? 'primary' : 'default'}
        shape={'circle'}
        icon={<CameraOutlined />}
      />
      <Button
        type={produce.mic.enabled ? 'primary' : 'default'}
        shape={'circle'}
        icon={<AudioOutlined />}
      />
    </Space>
  );
});
RTCController.displayName = 'RTCController';
