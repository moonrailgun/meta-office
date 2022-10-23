import React, { createContext, memo, useContext, useMemo, useRef } from 'react';
import { DefaultPosition } from './const';
import { useLogin } from './hooks/useLogin';
import { usePlayground } from './hooks/usePlayground';
import { usePositionVolume } from './hooks/usePositionVolume';
import { useRoomData } from './hooks/useRoomData';
import { useRTCClientStore } from './rtc/store';
import { Position, UserInfo } from './type';

interface GlobalContextData {
  login: () => void;
  fakeLogin: () => void;
  userInfo?: UserInfo;
  roomDataContext: ReturnType<typeof useRoomData>;
  playgroundContext: ReturnType<typeof usePlayground>;
  calcPositionVolume: (position: Position) => number;
}

const GlobalContext = createContext({} as GlobalContextData);

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> =
  memo(({ children }) => {
    const playgroundContext = usePlayground();
    const { userInfo, login, fakeLogin } = useLogin();
    const { roomId } = useRTCClientStore();
    const roomDataContext = useRoomData({
      roomId,
      userInfo,
      positionTransfromer: playgroundContext.positionTransformer,
    });
    const { calcPositionVolume } = usePositionVolume(
      roomDataContext.currentUser?.position || DefaultPosition
    );

    const contextData = useMemo(
      () => ({
        userInfo,
        login,
        fakeLogin,
        roomDataContext,
        playgroundContext,
        calcPositionVolume,
      }),
      [
        userInfo,
        login,
        fakeLogin,
        roomDataContext,
        playgroundContext,
        calcPositionVolume,
      ]
    );

    return (
      <GlobalContext.Provider value={contextData}>
        {children}
      </GlobalContext.Provider>
    );
  });

export function useGlobalContext() {
  return useContext(GlobalContext);
}
