import React, { createContext, memo, useContext } from 'react';
import { useLogin } from './hooks/useLogin';
import { UserInfo } from './type';

interface GlobalContextData {
  userInfo?: UserInfo;
  login: () => void;
}

const GlobalContext = createContext({} as GlobalContextData);

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> =
  memo(({ children }) => {
    const { userInfo, login } = useLogin();

    const contextData = {
      userInfo,
      login,
    };

    return (
      <GlobalContext.Provider value={contextData}>
        {children}
      </GlobalContext.Provider>
    );
  });

export function useGlobalContext() {
  return useContext(GlobalContext);
}
