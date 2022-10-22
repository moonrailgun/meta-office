import React from 'react';
import { AudioOutlined, CameraOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useRTCClientStore } from '../rtc/store';

export const RTCController: React.FC = React.memo(() => {
  const { produce, switchWebcam, switchMic, roomId } = useRTCClientStore();

  const disabled = !roomId;

  return (
    <Space>
      <Button
        type={produce.webcam.enabled ? 'primary' : 'default'}
        shape={'circle'}
        disabled={disabled}
        icon={<CameraOutlined />}
        onClick={switchWebcam}
      />
      <Button
        type={produce.mic.enabled ? 'primary' : 'default'}
        shape={'circle'}
        disabled={disabled}
        icon={<AudioOutlined />}
        onClick={switchMic}
      />
    </Space>
  );
});
RTCController.displayName = 'RTCController';
