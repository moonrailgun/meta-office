import React, { useState } from 'react';
import { useRTCClientStore } from '../rtc/store';

export const ProduceInfo: React.FC = React.memo(() => {
  const { produce } = useRTCClientStore();

  return <div>{JSON.stringify(produce)}</div>;
});
ProduceInfo.displayName = 'ProduceInfo';
