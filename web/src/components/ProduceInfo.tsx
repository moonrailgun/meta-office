import React, { useState } from 'react';
import { useRTCClientStore, peerId } from '../rtc/store';

/**
 * 用于测试
 */
export const ProduceInfo: React.FC = React.memo(() => {
  const { produce } = useRTCClientStore();

  return (
    <div>
      ({peerId}){JSON.stringify(produce)}
    </div>
  );
});
ProduceInfo.displayName = 'ProduceInfo';
