import { memo } from 'react';
import { LoginButton } from './components/LoginButton';
import { GlobalContextProvider, useGlobalContext } from './context';
import styles from './App.module.less';
import { useRTCClientStore } from './rtc/store';
import { RoomId } from './components/RoomID';
import { Header } from './components/Header';
import { Playground } from './components/Playground';
import { MessageInput } from './components/MessageInput';
import { Spin } from 'antd';
import 'antd/dist/antd.css';

const AppInner: React.FC = memo(() => {
  const { joined } = useRTCClientStore();
  const { userInfo } = useGlobalContext();

  if (!userInfo) {
    return <LoginButton />;
  }

  return (
    <div className={styles.App}>
      <Header />

      <div className={styles.mainContent}>
        <RoomId />

        <Spin spinning={!joined}>
          <Playground />
        </Spin>

        <MessageInput />
      </div>
    </div>
  );
});

const App: React.FC = () => {
  return (
    <GlobalContextProvider>
      <AppInner />
    </GlobalContextProvider>
  );
};

export default App;
