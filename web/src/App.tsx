import { memo, ReactNode } from 'react';
import { LoginButton } from './components/LoginButton';
import { GlobalContextProvider, useGlobalContext } from './context';
import styles from './App.module.less';
import { useRTCClientStore } from './rtc/store';
import { RoomId } from './components/RoomID';
import { Header } from './components/Header';
import { ProduceInfo } from './components/ProduceInfo';
import { Playground } from './components/Playground';
import { Peer } from './rtc/Peer';
import { MessageInput } from './components/MessageInput';
import 'antd/dist/antd.css';

const AppInner: React.FC = memo(() => {
  const { peers } = useRTCClientStore();
  const { userInfo } = useGlobalContext();

  if (!userInfo) {
    return <LoginButton />;
  }

  return (
    <div className={styles.App}>
      <Header />

      <div className={styles.mainContent}>
        <RoomId />

        {/* <ProduceInfo /> */}
        {/* <div>{JSON.stringify(peers)}</div> */}

        <Playground />

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
