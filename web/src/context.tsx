import React, { createContext, memo, useContext, useMemo } from 'react';
import { useLogin } from './hooks/useLogin';
import { useRoomData } from './hooks/useRoomData';
import { useRTCClientStore } from './rtc/store';
import { UserInfo } from './type';

interface GlobalContextData {
  login: () => void;
  userInfo?: UserInfo;
  roomDataContext: ReturnType<typeof useRoomData>;
}

const GlobalContext = createContext({} as GlobalContextData);

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> =
  memo(({ children }) => {
    const { userInfo, login } = useLogin();
    const { roomId } = useRTCClientStore();
    const roomDataContext = useRoomData({
      roomId,
      userInfo,
    });

    const contextData = useMemo(
      () => ({
        userInfo,
        login,
        roomDataContext,
      }),
      [userInfo, login, roomDataContext]
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
